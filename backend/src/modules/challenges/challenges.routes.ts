import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { challengesController } from './challenges.controller';

const router = Router();

router.get('/challenges', requireAuth, (req, res, next) =>
  challengesController.getChallenges(req as any, res, next)
);
router.post('/challenges/:id/claim', requireAuth, (req, res, next) =>
  challengesController.claim(req as any, res, next)
);

export { router as challengesRoutes };
