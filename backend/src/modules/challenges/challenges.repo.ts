import { prisma } from '../../config/db';

export function getActiveTemplates() {
  return prisma.challengeTemplate.findMany({ where: { active: true } });
}

export function getProgress(userId: string, templateId: string, periodStart: Date) {
  return prisma.userChallengeProgress.findUnique({
    where: { userId_templateId_periodStart: { userId, templateId, periodStart } },
  });
}

export async function upsertProgress(
  userId: string,
  templateId: string,
  periodStart: Date,
  progress: number,
  total: number
) {
  const cappedProgress = Math.min(progress, total);
  const done = cappedProgress >= total;
  const existing = await prisma.userChallengeProgress.findUnique({
    where: { userId_templateId_periodStart: { userId, templateId, periodStart } },
  });
  // Preserve completedAt once set so "done since" is stable across recomputes.
  const completedAt = existing?.completedAt ?? (done ? new Date() : null);
  return prisma.userChallengeProgress.upsert({
    where: { userId_templateId_periodStart: { userId, templateId, periodStart } },
    create: {
      userId,
      templateId,
      periodStart,
      progress: cappedProgress,
      total,
      done,
      completedAt,
    },
    update: {
      progress: cappedProgress,
      total,
      done,
      completedAt,
    },
  });
}

export function markClaimed(userId: string, templateId: string, periodStart: Date) {
  return prisma.userChallengeProgress.update({
    where: { userId_templateId_periodStart: { userId, templateId, periodStart } },
    data: { claimed: true, claimedAt: new Date() },
  });
}

export function countPendingClaims(userId: string) {
  return prisma.userChallengeProgress.count({
    where: { userId, done: true, claimed: false },
  });
}
