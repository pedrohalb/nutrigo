import { Worker } from 'bullmq';
import { redisConnection } from './connection';
import { prisma } from '../config/db';
import { aiService } from '../ai/aiService';
import { jobs, type GenerateUnitJobData, type GenerateLessonJobData, type GenerateSummaryJobData } from './jobs';
import type { GoalKind } from '@prisma/client';

function buildProfile(p: { name: string; objectives: string[]; topics: string[]; goal: GoalKind }) {
  return { name: p.name, objectives: p.objectives, topics: p.topics, goal: p.goal };
}

export function startWorkers() {
  const unitWorker = new Worker<GenerateUnitJobData>(
    'generate-unit',
    async (job) => {
      const { unitId, userId } = job.data;

      await prisma.unit.update({ where: { id: unitId }, data: { status: 'generating' } });

      const profile = await prisma.profile.findUniqueOrThrow({ where: { userId } });
      const unit = await prisma.unit.findUniqueOrThrow({ where: { id: unitId } });

      const result = await aiService.generateFullUnit(
        buildProfile(profile),
        unit.title,
        unit.section,
        unit.unitNumber
      );

      await prisma.$transaction(async (tx) => {
        await tx.unit.update({
          where: { id: unitId },
          data: {
            status: 'generated',
            studyMaterial: result.studyMaterial as any,
            generatedAt: new Date(),
          },
        });

        for (const lesson of result.lessons) {
          const createdLesson = await tx.lesson.create({
            data: {
              unitId,
              orderIndex: lesson.orderIndex,
              title: lesson.title,
              status: lesson.orderIndex === 0 ? 'generated' : 'skeleton',
            },
          });

          for (let i = 0; i < lesson.questions.length; i++) {
            await tx.question.create({
              data: {
                lessonId: createdLesson.id,
                orderIndex: i,
                type: lesson.questions[i].type as any,
                payload: lesson.questions[i] as any,
              },
            });
          }
        }
      });

      console.log(`Unit ${unitId} generated successfully`);
    },
    { connection: redisConnection }
  );

  const lessonWorker = new Worker<GenerateLessonJobData>(
    'generate-lesson',
    async (job) => {
      const { lessonId, unitId, userId, orderIndex } = job.data;

      await prisma.lesson.update({ where: { id: lessonId }, data: { status: 'generating' } });

      const profile = await prisma.profile.findUniqueOrThrow({ where: { userId } });
      const unit = await prisma.unit.findUniqueOrThrow({ where: { id: unitId } });
      const previousLessons = await prisma.lesson.findMany({
        where: { unitId, orderIndex: { lt: orderIndex } },
        orderBy: { orderIndex: 'asc' },
        select: { title: true },
      });

      const result = await aiService.generateLesson(
        buildProfile(profile),
        unit.title,
        previousLessons.map((l) => l.title),
        orderIndex
      );

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
              type: result.questions[i].type as any,
              payload: result.questions[i] as any,
            },
          });
        }
      });

      console.log(`Lesson ${lessonId} generated successfully`);
    },
    { connection: redisConnection }
  );

  const summaryWorker = new Worker<GenerateSummaryJobData>(
    'generate-summary',
    async (job) => {
      const { unitId, userId } = job.data;

      const unit = await prisma.unit.findUniqueOrThrow({
        where: { id: unitId },
        include: { lessons: { orderBy: { orderIndex: 'asc' } } },
      });

      const result = await aiService.generateUnitSummary(
        unit.title,
        unit.lessons.map((l) => l.title)
      );

      await prisma.unit.update({
        where: { id: unitId },
        data: { summary: result.summary, status: 'completed', completedAt: new Date() },
      });

      // Enqueue skeleton generation for next unit
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
        await jobs.enqueueGenerateUnit({ unitId: nextUnit.id, userId });
      }

      console.log(`Summary for unit ${unitId} generated`);
    },
    { connection: redisConnection }
  );

  unitWorker.on('failed', (job, err) =>
    console.error(`generate-unit job ${job?.id} failed:`, err.message)
  );
  lessonWorker.on('failed', (job, err) =>
    console.error(`generate-lesson job ${job?.id} failed:`, err.message)
  );
  summaryWorker.on('failed', (job, err) =>
    console.error(`generate-summary job ${job?.id} failed:`, err.message)
  );

  return { unitWorker, lessonWorker, summaryWorker };
}
