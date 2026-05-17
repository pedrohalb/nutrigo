import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { chatController } from './chat.controller';

const router = Router();

router.get('/units/:id/chat/messages', requireAuth, (req, res, next) =>
  chatController.getMessages(req as any, res, next)
);
router.post('/units/:id/chat/messages', requireAuth, (req, res, next) =>
  chatController.sendMessage(req as any, res, next)
);

export { router as chatRoutes };
