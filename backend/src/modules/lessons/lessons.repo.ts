import { prisma } from '../../config/db';

export const lessonsRepo = {
  findById(id: string) {
    return prisma.lesson.findUnique({
      where: { id },
      include: {
        questions: { orderBy: { orderIndex: 'asc' } },
        unit: { select: { userId: true, id: true, title: true, unitNumber: true } },
      },
    });
  },

  findByUnit(unitId: string) {
    return prisma.lesson.findMany({
      where: { unitId },
      orderBy: { orderIndex: 'asc' },
    });
  },

  countQuestions(lessonId: string) {
    return prisma.question.count({ where: { lessonId } });
  },

  markCompleted(id: string) {
    return prisma.lesson.update({
      where: { id },
      data: { status: 'completed', completedAt: new Date() },
    });
  },

  unlockNext(id: string) {
    return prisma.lesson.update({
      where: { id },
      data: { status: 'generated', generatedAt: new Date() },
    });
  },

  upsertAttempts(
    userId: string,
    lessonId: string,
    entries: Array<{ questionId: string; userAnswer: unknown; isCorrect: boolean }>
  ) {
    return prisma.$transaction(
      entries.map((e) =>
        prisma.attempt.upsert({
          where: { userId_questionId: { userId, questionId: e.questionId } },
          create: {
            userId,
            questionId: e.questionId,
            lessonId,
            userAnswer: e.userAnswer as any,
            isCorrect: e.isCorrect,
          },
          update: {
            userAnswer: e.userAnswer as any,
            isCorrect: e.isCorrect,
            answeredAt: new Date(),
          },
        })
      )
    );
  },
};
