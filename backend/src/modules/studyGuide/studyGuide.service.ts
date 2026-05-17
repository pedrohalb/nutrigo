import { prisma } from '../../config/db';
import { AppError } from '../../middleware/errorHandler';

function resolveUserAnswer(payload: any, userAnswer: any): string {
  if (!userAnswer) return '—';
  if (payload.type === 'multiple-choice' || payload.type === 'image-choice') {
    const idx = userAnswer.selectedIndex;
    if (typeof idx !== 'number') return '—';
    const opt = payload.options?.[idx];
    if (!opt) return '—';
    return typeof opt === 'string' ? opt : opt.label ?? '—';
  }
  if (payload.type === 'fill-blank') {
    return userAnswer.selectedChip ?? '—';
  }
  return '—';
}

function resolveQuestionText(payload: any): string {
  return payload.question ?? '';
}

async function assertUnitOwner(unitId: string, userId: string) {
  const unit = await prisma.unit.findFirst({ where: { id: unitId, userId } });
  if (!unit) throw new AppError(404, 'NOT_FOUND', 'Unit not found');
  return unit;
}

export const studyGuideService = {
  async getStudyMaterial(unitId: string, userId: string) {
    const unit = await assertUnitOwner(unitId, userId);

    // Mark study guide visit for challenge tracking
    await prisma.profile.update({
      where: { userId },
      data: { lastStudyGuideVisit: new Date() },
    });

    return { studyMaterial: unit.studyMaterial };
  },

  async getReview(unitId: string, userId: string) {
    await assertUnitOwner(unitId, userId);

    const lessons = await prisma.lesson.findMany({
      where: { unitId },
      orderBy: { orderIndex: 'asc' },
      include: {
        questions: { orderBy: { orderIndex: 'asc' } },
      },
    });

    const attemptedQuestionIds = await prisma.attempt
      .findMany({
        where: {
          userId,
          lesson: { unitId },
        },
        select: { questionId: true, isCorrect: true, userAnswer: true },
      })
      .then((rows) => new Map(rows.map((r) => [r.questionId, r])));

    return lessons.map((lesson) => {
      const attempted = lesson.questions.filter((q) =>
        attemptedQuestionIds.has(q.id)
      );
      const correct = attempted.filter(
        (q) => attemptedQuestionIds.get(q.id)?.isCorrect
      ).length;
      const progress =
        attempted.length > 0 ? Math.round((correct / attempted.length) * 100) : 0;

      return {
        title: lesson.title,
        questionsCount: lesson.questions.length,
        progress,
        questions: attempted.map((q) => {
          const attempt = attemptedQuestionIds.get(q.id)!;
          const payload = q.payload as any;
          return {
            id: q.id,
            text: resolveQuestionText(payload),
            correct: attempt.isCorrect,
            fullQuestion: resolveQuestionText(payload),
            userAnswer: resolveUserAnswer(payload, attempt.userAnswer),
            explanation: payload.explanation ?? '',
          };
        }),
      };
    });
  },
};
