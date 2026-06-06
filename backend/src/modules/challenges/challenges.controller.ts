import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { challengesService } from './challenges.service';

export const challengesController = {
  async getChallenges(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await challengesService.getChallenges(req.userId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async claim(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await challengesService.claim(req.userId, String(req.params.id));
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
};
