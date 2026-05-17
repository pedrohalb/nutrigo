import { GoalKind } from '@prisma/client';
import { prisma } from '../../config/db';

export const profileRepo = {
  findByUserId(userId: string) {
    return prisma.profile.findUnique({ where: { userId } });
  },

  create(data: {
    userId: string;
    name: string;
    objectives: string[];
    topics: string[];
    goal: GoalKind;
  }) {
    return prisma.profile.create({ data });
  },

  update(userId: string, data: { name?: string }) {
    return prisma.profile.update({ where: { userId }, data });
  },

  findUserById(userId: string) {
    return prisma.user.findUnique({ where: { id: userId } });
  },
};
