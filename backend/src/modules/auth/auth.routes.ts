import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { authController } from './auth.controller';

const router = Router();

router.post('/signup', asyncHandler(authController.signup));
router.post('/login', asyncHandler(authController.login));
router.post('/forgot-password', asyncHandler(authController.forgotPassword));
router.post('/reset-password', asyncHandler(authController.resetPassword));
router.post('/logout', asyncHandler(authController.logout));

export { router as authRoutes };
