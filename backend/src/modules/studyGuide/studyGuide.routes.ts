import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { studyGuideController } from './studyGuide.controller';

const router = Router();

router.get('/units/:id/study-material', requireAuth, (req, res, next) =>
  studyGuideController.getStudyMaterial(req as any, res, next)
);
router.get('/units/:id/review', requireAuth, (req, res, next) =>
  studyGuideController.getReview(req as any, res, next)
);

export { router as studyGuideRoutes };
