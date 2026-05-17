import { prisma } from '../../config/db';
import * as repo from './challenges.repo';

function startOfDay(date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
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

    const results = await Promise.all(
      templates.map(async (t) => {
        const periodStart = t.kind === 'daily' ? todayStart : weekStart;
        const params = t.ruleParams as Record<string, number>;
        const { progress, total } = await computeProgress(userId, t.rule, params, t.kind);
        await repo.upsertProgress(userId, t.id, periodStart, progress, total);

        return {
          id: t.id,
          kind: t.kind,
          emoji: t.emoji,
          title: t.title,
          desc: t.description,
          exp: t.exp,
          progress,
          total,
          done: progress >= total,
        };
      })
    );

    return {
      daily: results.filter((c) => c.kind === 'daily'),
      weekly: results.filter((c) => c.kind === 'weekly'),
    };
  },
};
