import { GoalKind } from '@prisma/client';
import { AppError } from '../../middleware/errorHandler';
import { profileRepo } from './profile.repo';
import { unitsRepo } from '../units/units.repo';
import { aiService } from '../../ai/aiService';
import { jobs } from '../../queue/jobs';
import { buildLayout } from '../units/unitLayoutService';

export const profileService = {
  async onboarding(
    userId: string,
    data: {
      name: string;
      objectives: string[];
      topics: string[];
      goal: GoalKind;
    }
  ) {
    const existing = await profileRepo.findByUserId(userId);
    if (existing) throw new AppError(409, 'PROFILE_EXISTS', 'Profile already created');

    const profile = await profileRepo.create({ userId, ...data });

    // Generate unit skeletons synchronously
    const skeletonResult = await aiService.generateUnitSkeletons({
      name: data.name,
      objectives: data.objectives,
      topics: data.topics,
      goal: data.goal,
    });

    const createdUnits = await unitsRepo.createSkeletons(userId, skeletonResult.units);

    // Enqueue full generation for Unit 1 (first in order)
    const unit1 = createdUnits.find(
      (u) => u.section === skeletonResult.units[0].section &&
             u.unitNumber === skeletonResult.units[0].unitNumber
    ) ?? createdUnits[0];

    await jobs.enqueueGenerateUnit({ unitId: unit1.id, userId });

    const units = createdUnits.map((u) => ({
      id: u.id,
      section: u.section,
      unit: u.unitNumber,
      title: u.title,
      status: u.status,
      nodes: buildLayout([]).nodes,
      mascots: buildLayout([]).mascots,
    }));

    return { profile, units };
  },

  async getMe(userId: string) {
    const [user, profile] = await Promise.all([
      profileRepo.findUserById(userId),
      profileRepo.findByUserId(userId),
    ]);
    if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User not found');

    // Find current unit: first non-completed generated unit
    const currentUnit = profile
      ? await import('../../config/db').then(({ prisma }) =>
          prisma.unit.findFirst({
            where: { userId, status: { in: ['generated', 'generating'] } },
            orderBy: [{ section: 'asc' }, { unitNumber: 'asc' }],
          })
        )
      : null;

    return {
      user: { id: user.id, email: user.email },
      profile,
      stats: {
        level: profile?.level ?? 1,
        xp: profile?.xp ?? 0,
        xp_for_next_level: (profile?.level ?? 1) * 1000,
        streak_days: profile?.streakDays ?? 0,
      },
      currentUnitId: currentUnit?.id ?? null,
    };
  },

  async updateMe(userId: string, data: { name?: string }) {
    const profile = await profileRepo.update(userId, data);
    return { profile };
  },
};
