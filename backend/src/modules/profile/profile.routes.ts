import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { profileController } from './profile.controller';

const router = Router();

router.post('/me/onboarding', requireAuth, (req, res, next) =>
  profileController.onboarding(req as any, res, next)
);
router.get('/me', requireAuth, (req, res, next) =>
  profileController.getMe(req as any, res, next)
);
router.put('/me', requireAuth, (req, res, next) =>
  profileController.updateMe(req as any, res, next)
);

export { router as profileRoutes };
