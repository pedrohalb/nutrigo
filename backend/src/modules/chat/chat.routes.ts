import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/asyncHandler';
import { chatController } from './chat.controller';

const router = Router();

router.get('/units/:id/chat/messages', requireAuth, asyncHandler(chatController.getMessages));
router.post('/units/:id/chat/messages', requireAuth, asyncHandler(chatController.sendMessage));

export { router as chatRoutes };
