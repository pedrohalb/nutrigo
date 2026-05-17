import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { unitsService } from './units.service';

export const unitsController = {
  async getUnits(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await unitsService.getUnits(req.userId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async getUnit(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await unitsService.getUnit(String(req.params.id), req.userId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
};
