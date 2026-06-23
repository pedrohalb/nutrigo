import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/asyncHandler';
import { challengesController } from './challenges.controller';

const router = Router();

router.get('/challenges', requireAuth, asyncHandler(challengesController.getChallenges));
router.post('/challenges/:id/claim', requireAuth, asyncHandler(challengesController.claim));

export { router as challengesRoutes };
