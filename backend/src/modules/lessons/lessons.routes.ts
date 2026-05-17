import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { lessonsController } from './lessons.controller';

const router = Router();

router.get('/lessons/:id', requireAuth, (req, res, next) =>
  lessonsController.getLesson(req as any, res, next)
);
router.post('/lessons/:id/submit', requireAuth, (req, res, next) =>
  lessonsController.submit(req as any, res, next)
);

export { router as lessonsRoutes };
