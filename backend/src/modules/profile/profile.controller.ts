import { Response } from 'express';
import { z } from 'zod';
import { GoalKind } from '@prisma/client';
import { profileService } from './profile.service';
import { AuthRequest } from '../../middleware/auth';

const onboardingSchema = z.object({
  name: z.string().min(1),
  objectives: z.array(z.string()).min(1),
  topics: z.array(z.string()).min(3),
  goal: z.nativeEnum(GoalKind),
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
});

export const profileController = {
  async onboarding(req: AuthRequest, res: Response) {
    const body = onboardingSchema.parse(req.body);
    const result = await profileService.onboarding(req.userId, body);
    res.status(201).json(result);
  },

  async getMe(req: AuthRequest, res: Response) {
    const result = await profileService.getMe(req.userId);
    res.json(result);
  },

  async updateMe(req: AuthRequest, res: Response) {
    const body = updateSchema.parse(req.body);
    const result = await profileService.updateMe(req.userId, body);
    res.json(result);
  },
};
