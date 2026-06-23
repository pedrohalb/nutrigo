import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/asyncHandler';
import { lessonsController } from './lessons.controller';

const router = Router();

router.get('/lessons/:id', requireAuth, asyncHandler(lessonsController.getLesson));
router.post('/lessons/:id/submit', requireAuth, asyncHandler(lessonsController.submit));

export { router as lessonsRoutes };
