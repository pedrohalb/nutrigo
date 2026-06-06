import { prisma } from '../../config/db';
import * as repo from './challenges.repo';
import { AppError } from '../../middleware/errorHandler';

function startOfDay(date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Deterministic numeric hash of a string (FNV-1a, 32-bit, unsigned).
function hash32(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function dailySeed(userId: string, day: Date): number {
  return hash32(`${userId}:${day.toISOString().slice(0, 10)}`);
}

function startOfWeek(date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function computeProgress(
  userId: string,
  rule: string,
  ruleParams: Record<string, number>,
  kind: string
): Promise<{ progress: number; total: number }> {
  const todayStart = startOfDay();
  const weekStart = startOfWeek();
  const target = ruleParams.target ?? 1;

  switch (rule) {
    case 'complete_lessons_today': {
      const count = await prisma.lesson.count({
        where: { unit: { userId }, status: 'completed', completedAt: { gte: todayStart } },
      });
      return { progress: count, total: target };
    }
    case 'complete_lessons_week': {
      const count = await prisma.lesson.count({
        where: { unit: { userId }, status: 'completed', completedAt: { gte: weekStart } },
      });
      return { progress: count, total: target };
    }
    case 'complete_lessons_perfect_today': {
      const lessons = await prisma.lesson.findMany({
        where: { unit: { userId }, status: 'completed', completedAt: { gte: todayStart } },
        include: {
          questions: { include: { attempts: { where: { userId } } } },
        },
      });
      const perfectCount = lessons.filter(
        (l) =>
          l.questions.length > 0 &&
          l.questions.every((q) => q.attempts.length > 0 && q.attempts[0].isCorrect)
      ).length;
      return { progress: perfectCount, total: target };
    }
    case 'streak_days': {
      const profile = await prisma.profile.findUnique({
        where: { userId },
        select: { streakDays: true },
      });
      return { progress: profile?.streakDays ?? 0, total: target };
    }
    case 'complete_unit': {
      const count = await prisma.unit.count({ where: { userId, status: 'completed' } });
      return { progress: count, total: target };
    }
    case 'enter_study_guide': {
      const profile = await prisma.profile.findUnique({
        where: { userId },
        select: { lastStudyGuideVisit: true },
      });
      const since = kind === 'daily' ? todayStart : weekStart;
      const visited =
        profile?.lastStudyGuideVisit != null && profile.lastStudyGuideVisit >= since;
      return { progress: visited ? 1 : 0, total: 1 };
    }
    case 'complete_first_lesson': {
      const count = await prisma.lesson.count({
        where: { unit: { userId }, status: 'completed' },
      });
      return { progress: Math.min(count, 1), total: 1 };
    }
    default:
      return { progress: 0, total: target };
  }
}

export const challengesService = {
  async getChallenges(userId: string) {
    const templates = await repo.getActiveTemplates();
    const todayStart = startOfDay();
    const weekStart = startOfWeek();

    // Pick the single daily template assigned to this user today.
    // Stays the same across requests on the same day (deterministic seed).
    const allDailyTemplates = templates.filter((t) => t.kind === 'daily');
    const pickedDailyTemplate = allDailyTemplates.length
      ? allDailyTemplates[dailySeed(userId, todayStart) % allDailyTemplates.length]
      : null;

    // Only the picked daily + every weekly is computed & persisted. Other dailies
    // never get progress rows, so countPendingClaims naturally matches the screen.
    const templatesToCompute = templates.filter(
      (t) => t.kind === 'weekly' || (pickedDailyTemplate && t.id === pickedDailyTemplate.id),
    );

    const results = await Promise.all(
      templatesToCompute.map(async (t) => {
        const periodStart = t.kind === 'daily' ? todayStart : weekStart;
        const params = t.ruleParams as Record<string, number>;
        const { progress: rawProgress, total } = await computeProgress(
          userId,
          t.rule,
          params,
          t.kind,
        );
        const progress = Math.min(rawProgress, total);
        const row = await repo.upsertProgress(userId, t.id, periodStart, progress, total);

        return {
          id: t.id,
          kind: t.kind,
          emoji: t.emoji,
          title: t.title,
          desc: t.description,
          exp: t.exp,
          progress,
          total,
          done: row.done,
          claimed: row.claimed,
          periodStart: periodStart.toISOString(),
        };
      })
    );

    // Count only what's actually displayed (today's daily + active weeklys)
    const pendingClaims = results.filter((r) => r.done && !r.claimed).length;

    return {
      daily: results.filter((c) => c.kind === 'daily'),
      weekly: results.filter((c) => c.kind === 'weekly'),
      pendingClaims,
    };
  },

  async claim(userId: string, templateId: string) {
    const template = await prisma.challengeTemplate.findUnique({ where: { id: templateId } });
    if (!template) throw new AppError(404, 'NOT_FOUND', 'Challenge template not found');
    const periodStart = template.kind === 'daily' ? startOfDay() : startOfWeek();
    const row = await repo.getProgress(userId, templateId, periodStart);
    if (!row) throw new AppError(404, 'NOT_FOUND', 'No progress for this challenge in current period');
    if (!row.done) throw new AppError(400, 'NOT_DONE', 'Challenge is not completed yet');
    if (row.claimed) throw new AppError(400, 'ALREADY_CLAIMED', 'Challenge already claimed');

    await repo.markClaimed(userId, templateId, periodStart);

    // Grant XP — reuse the same level-up math as lessons submit.
    const profile = await prisma.profile.findUniqueOrThrow({ where: { userId } });
    let newXp = profile.xp + template.exp;
    let newLevel = profile.level;
    let levelUp = false;
    while (newXp >= newLevel * 1000) {
      newXp -= newLevel * 1000;
      newLevel++;
      levelUp = true;
    }
    await prisma.profile.update({
      where: { userId },
      data: { xp: newXp, level: newLevel },
    });

    return {
      xpEarned: template.exp,
      levelUp,
      newLevel,
    };
  },
};
