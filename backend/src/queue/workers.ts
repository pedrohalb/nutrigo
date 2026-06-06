import { Worker } from 'bullmq';
import { redisConnection } from './connection';
import { prisma } from '../config/db';
import { aiService } from '../ai/aiService';
import { jobs, type GenerateUnitJobData, type GenerateLessonJobData, type GenerateSummaryJobData } from './jobs';
import type { GoalKind } from '@prisma/client';

function buildProfile(p: { name: string; objectives: string[]; topics: string[]; goal: GoalKind }) {
  return { name: p.name, objectives: p.objectives, topics: p.topics, goal: p.goal };
}

// A IA retorna "multiple-choice" mas o Prisma enum é "multiple_choice"
function toQuestionType(aiType: string) {
  const map: Record<string, 'multiple_choice' | 'image_choice' | 'fill_blank'> = {
    'multiple-choice': 'multiple_choice',
    'image-choice':    'image_choice',
    'fill-blank':      'fill_blank',
  };
  return map[aiType] ?? 'multiple_choice';
}

// Fisher-Yates returning permutation indices
function permutation(n: number): number[] {
  const p = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  return p;
}

// Shuffles options in-place and biases against the correct answer landing on index 0
function shuffleQuestionInPlace(q: any) {
  if (q.type === 'multiple-choice' || q.type === 'image-choice') {
    if (!Array.isArray(q.options) || typeof q.correctIndex !== 'number') return;
    const perm = permutation(q.options.length);
    let newOptions = perm.map((oi) => q.options[oi]);
    let newCorrect = perm.indexOf(q.correctIndex);
    if (newCorrect === 0 && newOptions.length > 1 && Math.random() < 0.6) {
      const swap = 1 + Math.floor(Math.random() * (newOptions.length - 1));
      [newOptions[0], newOptions[swap]] = [newOptions[swap], newOptions[0]];
      newCorrect = swap;
    }
    q.options = newOptions;
    q.correctIndex = newCorrect;
  } else if (q.type === 'fill-blank') {
    if (!Array.isArray(q.chips)) return;
    const perm = permutation(q.chips.length);
    q.chips = perm.map((oi: number) => q.chips[oi]);
  }
}

function shuffleQuestions(questions: any[]) {
  for (const q of questions) shuffleQuestionInPlace(q);
}

export function startWorkers() {
  // ── Worker: generate-unit ──────────────────────────────────────────────
  const unitWorker = new Worker<GenerateUnitJobData>(
    'generate-unit',
    async (job) => {
      const { unitId, userId } = job.data;
      console.log(`[generate-unit] Iniciando job=${job.id} unitId=${unitId}`);

      await prisma.unit.update({ where: { id: unitId }, data: { status: 'generating' } });
      console.log(`[generate-unit] Status → generating`);

      const profile = await prisma.profile.findUniqueOrThrow({ where: { userId } });
      const unit = await prisma.unit.findUniqueOrThrow({ where: { id: unitId } });
      console.log(`[generate-unit] Gerando unidade "${unit.title}" (seção ${unit.section}, nº ${unit.unitNumber})`);

      const t0 = Date.now();
      const result = await aiService.generateFullUnit(
        buildProfile(profile),
        unit.title,
        unit.section,
        unit.unitNumber
      );
      console.log(`[generate-unit] AI respondeu em ${Date.now() - t0}ms — ${result.lessons.length} lições, studyMaterial sections: ${result.studyMaterial.sections.length}`);

      await prisma.$transaction(async (tx) => {
        await tx.unit.update({
          where: { id: unitId },
          data: {
            status: 'generated',
            studyMaterial: result.studyMaterial as any,
            generatedAt: new Date(),
          },
        });
        console.log(`[generate-unit] Unidade atualizada no banco`);

        for (const lesson of result.lessons) {
          shuffleQuestions(lesson.questions);
          const isFirst = lesson.orderIndex === 0;
          const createdLesson = await tx.lesson.create({
            data: {
              unitId,
              orderIndex: lesson.orderIndex,
              title: lesson.title,
              status: isFirst ? 'generated' : 'skeleton',
            },
          });
          console.log(`[generate-unit] Lição ${lesson.orderIndex} criada: "${lesson.title}" (${isFirst ? 'generated' : 'skeleton'}) — ${lesson.questions.length} questões`);

          for (let i = 0; i < lesson.questions.length; i++) {
            await tx.question.create({
              data: {
                lessonId: createdLesson.id,
                orderIndex: i,
                type: toQuestionType(lesson.questions[i].type),
                payload: lesson.questions[i] as any,
              },
            });
          }
        }
      });

      console.log(`[generate-unit] ✓ Unidade ${unitId} ("${unit.title}") concluída`);
    },
    { connection: redisConnection }
  );

  // ── Worker: generate-lesson ────────────────────────────────────────────
  const lessonWorker = new Worker<GenerateLessonJobData>(
    'generate-lesson',
    async (job) => {
      const { lessonId, unitId, userId, orderIndex } = job.data;
      console.log(`[generate-lesson] Iniciando job=${job.id} lessonId=${lessonId} orderIndex=${orderIndex}`);

      await prisma.lesson.update({ where: { id: lessonId }, data: { status: 'generating' } });
      console.log(`[generate-lesson] Status → generating`);

      const profile = await prisma.profile.findUniqueOrThrow({ where: { userId } });
      const unit = await prisma.unit.findUniqueOrThrow({ where: { id: unitId } });
      const previousLessons = await prisma.lesson.findMany({
        where: { unitId, orderIndex: { lt: orderIndex } },
        orderBy: { orderIndex: 'asc' },
        select: { title: true },
      });
      console.log(`[generate-lesson] Gerando lição ${orderIndex} da unidade "${unit.title}" | lições anteriores: [${previousLessons.map(l => l.title).join(', ')}]`);

      const t0 = Date.now();
      const result = await aiService.generateLesson(
        buildProfile(profile),
        unit.title,
        previousLessons.map((l) => l.title),
        orderIndex
      );
      console.log(`[generate-lesson] AI respondeu em ${Date.now() - t0}ms — "${result.title}" com ${result.questions.length} questões`);

      shuffleQuestions(result.questions);
      await prisma.$transaction(async (tx) => {
        await tx.lesson.update({
          where: { id: lessonId },
          data: { title: result.title, status: 'generated', generatedAt: new Date() },
        });

        for (let i = 0; i < result.questions.length; i++) {
          await tx.question.create({
            data: {
              lessonId,
              orderIndex: i,
              type: toQuestionType(result.questions[i].type),
              payload: result.questions[i] as any,
            },
          });
        }
      });

      console.log(`[generate-lesson] ✓ Lição ${lessonId} ("${result.title}") concluída`);
    },
    { connection: redisConnection }
  );

  // ── Worker: generate-summary ───────────────────────────────────────────
  const summaryWorker = new Worker<GenerateSummaryJobData>(
    'generate-summary',
    async (job) => {
      const { unitId, userId } = job.data;
      console.log(`[generate-summary] Iniciando job=${job.id} unitId=${unitId}`);

      const unit = await prisma.unit.findUniqueOrThrow({
        where: { id: unitId },
        include: { lessons: { orderBy: { orderIndex: 'asc' } } },
      });
      console.log(`[generate-summary] Gerando resumo de "${unit.title}" — ${unit.lessons.length} lições`);

      const t0 = Date.now();
      const result = await aiService.generateUnitSummary(
        unit.title,
        unit.lessons.map((l) => l.title)
      );
      console.log(`[generate-summary] AI respondeu em ${Date.now() - t0}ms`);

      await prisma.unit.update({
        where: { id: unitId },
        data: { summary: result.summary, status: 'completed', completedAt: new Date() },
      });
      console.log(`[generate-summary] Unidade "${unit.title}" marcada como completed`);

      const nextUnit = await prisma.unit.findFirst({
        where: {
          userId,
          OR: [
            { section: unit.section, unitNumber: { gt: unit.unitNumber } },
            { section: { gt: unit.section } },
          ],
          status: 'skeleton',
        },
        orderBy: [{ section: 'asc' }, { unitNumber: 'asc' }],
      });

      if (nextUnit) {
        console.log(`[generate-summary] Enfileirando próxima unidade: "${nextUnit.title}" (${nextUnit.id})`);
        await jobs.enqueueGenerateUnit({ unitId: nextUnit.id, userId });
      } else {
        console.log(`[generate-summary] Nenhuma próxima unidade skeleton encontrada`);
      }

      console.log(`[generate-summary] ✓ Resumo da unidade ${unitId} concluído`);
    },
    { connection: redisConnection }
  );

  // ── Error handlers ─────────────────────────────────────────────────────
  unitWorker.on('failed', (job, err) =>
    console.error(`[generate-unit] ✗ job=${job?.id} FALHOU:`, err.message, err.stack)
  );
  lessonWorker.on('failed', (job, err) =>
    console.error(`[generate-lesson] ✗ job=${job?.id} FALHOU:`, err.message, err.stack)
  );
  summaryWorker.on('failed', (job, err) =>
    console.error(`[generate-summary] ✗ job=${job?.id} FALHOU:`, err.message, err.stack)
  );

  unitWorker.on('active', (job) => console.log(`[generate-unit] Job ${job.id} ativo`));
  lessonWorker.on('active', (job) => console.log(`[generate-lesson] Job ${job.id} ativo`));
  summaryWorker.on('active', (job) => console.log(`[generate-summary] Job ${job.id} ativo`));

  console.log('[workers] Workers iniciados: generate-unit, generate-lesson, generate-summary');
  return { unitWorker, lessonWorker, summaryWorker };
}
