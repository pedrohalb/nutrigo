import { AppError } from '../../middleware/errorHandler';
import { lessonsRepo } from './lessons.repo';
import { profileRepo } from '../profile/profile.repo';
import { jobs } from '../../queue/jobs';

type UserAnswer =
  | { selectedIndex: number }
  | { selectedChip: string };

function checkAnswer(payload: any, userAnswer: UserAnswer): boolean {
  if (payload.type === 'multiple-choice' || payload.type === 'image-choice') {
    return (userAnswer as any).selectedIndex === payload.correctIndex;
  }
  if (payload.type === 'fill-blank') {
    return (userAnswer as any).selectedChip === payload.correctChip;
  }
  return false;
}

// Prisma's @db.Date round-trips through UTC midnight, so all date math here
// uses UTC components to stay consistent with what gets persisted.
function todayUTC(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function yesterdayUTC(): Date {
  return new Date(todayUTC().getTime() - 24 * 60 * 60 * 1000);
}

function sameDayUTC(a: Date | null | undefined, b: Date | null | undefined): boolean {
  if (!a || !b) return false;
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

export const lessonsService = {
  async getLesson(lessonId: string, userId: string) {
    const lesson = await lessonsRepo.findById(lessonId);
    if (!lesson) throw new AppError(404, 'NOT_FOUND', 'Lesson not found');
    if (lesson.unit.userId !== userId)
      throw new AppError(403, 'FORBIDDEN', 'Access denied');

    return {
      id: lesson.id,
      title: lesson.title,
      questions: lesson.questions.map((q) => ({
        ...(q.payload as object),
        id: q.id,
      })),
    };
  },

  async submit(
    userId: string,
    lessonId: string,
    answers: Array<{ questionId: string; userAnswer: UserAnswer }>
  ) {
    const lesson = await lessonsRepo.findById(lessonId);
    if (!lesson) throw new AppError(404, 'NOT_FOUND', 'Lesson not found');
    if (lesson.unit.userId !== userId)
      throw new AppError(403, 'FORBIDDEN', 'Access denied');

    const profile = await profileRepo.findByUserId(userId);
    if (!profile) throw new AppError(404, 'NOT_FOUND', 'Profile not found');

    const wasAlreadyCompleted = lesson.status === 'completed';

    // Score each answer
    const questionMap = new Map(lesson.questions.map((q) => [q.id, q]));
    const results = answers.map(({ questionId, userAnswer }) => {
      const q = questionMap.get(questionId);
      if (!q) return { questionId, isCorrect: false, explanation: '' };
      const isCorrect = checkAnswer(q.payload, userAnswer);
      return { questionId, isCorrect, explanation: (q.payload as any).explanation ?? '' };
    });

    // Persist attempts (always — so revision reflects the latest run)
    await lessonsRepo.upsertAttempts(
      userId,
      lessonId,
      results.map((r, i) => ({
        questionId: r.questionId,
        userAnswer: answers[i].userAnswer,
        isCorrect: r.isCorrect,
      }))
    );

    const correctCount = results.filter((r) => r.isCorrect).length;
    const today = todayUTC();
    const lastActive = profile.lastActiveDate ? new Date(profile.lastActiveDate) : null;
    const isFirstToday = !sameDayUTC(lastActive, today);

    // Replay: half XP, no streak change, no unit/next-lesson side effects.
    if (wasAlreadyCompleted) {
      const replayXp = Math.floor((correctCount * 20 + 100) / 2);

      // Level update (replay XP still counts toward leveling)
      let newXp = profile.xp + replayXp;
      let newLevel = profile.level;
      let levelUp = false;
      while (newXp >= newLevel * 1000) {
        newXp -= newLevel * 1000;
        newLevel++;
        levelUp = true;
      }

      await profileRepo.update(userId, {
        xp: newXp,
        level: newLevel,
      } as any);

      return {
        results,
        xpEarned: replayXp,
        levelUp,
        newLevel,
        streakDays: profile.streakDays,
        streakIncremented: false,
        unitCompleted: false,
        replay: true,
      };
    }

    // First completion — full XP, streak math, unlock next.
    const streakBonus = isFirstToday ? 10 : 0;
    const xpEarned = correctCount * 20 + 100 + streakBonus;

    // Streak update — only the first lesson of the day bumps it
    let newStreak = profile.streakDays;
    if (isFirstToday) {
      const wasYesterday = sameDayUTC(lastActive, yesterdayUTC());
      newStreak = wasYesterday ? profile.streakDays + 1 : 1;
    }

    // Level update
    let newXp = profile.xp + xpEarned;
    let newLevel = profile.level;
    let levelUp = false;
    while (newXp >= newLevel * 1000) {
      newXp -= newLevel * 1000;
      newLevel++;
      levelUp = true;
    }

    // Mark lesson completed + update profile
    await Promise.all([
      lessonsRepo.markCompleted(lessonId),
      profileRepo.update(userId, {
        xp: newXp,
        level: newLevel,
        streakDays: newStreak,
        lastActiveDate: today,
      } as any),
    ]);

    // Determine next action
    const allLessons = await lessonsRepo.findByUnit(lesson.unit.id);
    const remaining = allLessons.filter(
      (l) => l.id !== lessonId && l.status !== 'completed'
    );
    const unitCompleted = remaining.length === 0;

    if (unitCompleted) {
      await jobs.enqueueGenerateSummary({ unitId: lesson.unit.id, userId });
    } else {
      const next = allLessons.find(
        (l) => l.orderIndex === lesson.orderIndex + 1 && l.status !== 'completed'
      );
      if (next) {
        const hasQuestions = (await lessonsRepo.countQuestions(next.id)) > 0;
        if (hasQuestions) {
          await lessonsRepo.unlockNext(next.id);
        } else {
          await jobs.enqueueGenerateLesson({
            lessonId: next.id,
            unitId: lesson.unit.id,
            userId,
            orderIndex: next.orderIndex,
          });
        }
      }
    }

    return {
      results,
      xpEarned,
      levelUp,
      newLevel,
      streakDays: newStreak,
      streakIncremented: isFirstToday,
      unitCompleted,
      replay: false,
    };
  },
};
