import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { studyGuideService } from './studyGuide.service';

export const studyGuideController = {
  async getStudyMaterial(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await studyGuideService.getStudyMaterial(
        String(req.params.id),
        req.userId
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async getReview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await studyGuideService.getReview(
        String(req.params.id),
        req.userId
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
};
