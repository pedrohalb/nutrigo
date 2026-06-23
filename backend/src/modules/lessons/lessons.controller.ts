import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../../middleware/auth';
import { lessonsService } from './lessons.service';

const submitSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string().uuid(),
      userAnswer: z.union([
        z.object({ selectedIndex: z.number().int().min(0) }),
        z.object({ selectedChip: z.string() }),
      ]),
    })
  ).min(1),
});

export const lessonsController = {
  async getLesson(req: AuthRequest, res: Response) {
    const result = await lessonsService.getLesson(String(req.params.id), req.userId);
    res.json(result);
  },

  async submit(req: AuthRequest, res: Response) {
    const { answers } = submitSchema.parse(req.body);
    const result = await lessonsService.submit(req.userId, String(req.params.id), answers);
    res.json(result);
  },
};
