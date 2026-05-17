import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { unitsController } from './units.controller';

const router = Router();

router.get('/units', requireAuth, (req, res, next) =>
  unitsController.getUnits(req as any, res, next)
);
router.get('/units/:id', requireAuth, (req, res, next) =>
  unitsController.getUnit(req as any, res, next)
);

export { router as unitsRoutes };
