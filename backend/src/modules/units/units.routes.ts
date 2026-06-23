import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/asyncHandler';
import { unitsController } from './units.controller';

const router = Router();

router.get('/units', requireAuth, asyncHandler(unitsController.getUnits));
router.get('/units/:id', requireAuth, asyncHandler(unitsController.getUnit));

export { router as unitsRoutes };
