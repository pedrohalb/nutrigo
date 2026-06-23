import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/asyncHandler';
import { profileController } from './profile.controller';

const router = Router();

router.post('/me/onboarding', requireAuth, asyncHandler(profileController.onboarding));
router.get('/me', requireAuth, asyncHandler(profileController.getMe));
router.put('/me', requireAuth, asyncHandler(profileController.updateMe));

export { router as profileRoutes };
