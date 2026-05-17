import { prisma } from '../../config/db';

export function getActiveTemplates() {
  return prisma.challengeTemplate.findMany({ where: { active: true } });
}

export function getProgress(userId: string, templateId: string, periodStart: Date) {
  return prisma.userChallengeProgress.findUnique({
    where: { userId_templateId_periodStart: { userId, templateId, periodStart } },
  });
}

export function upsertProgress(
  userId: string,
  templateId: string,
  periodStart: Date,
  progress: number,
  total: number
) {
  const done = progress >= total;
  return prisma.userChallengeProgress.upsert({
    where: { userId_templateId_periodStart: { userId, templateId, periodStart } },
    create: { userId, templateId, periodStart, progress, total, done, completedAt: done ? new Date() : null },
    update: { progress, total, done, completedAt: done ? new Date() : undefined },
  });
}
