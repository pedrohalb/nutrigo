import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/asyncHandler';
import { studyGuideController } from './studyGuide.controller';

const router = Router();

router.get('/units/:id/study-material', requireAuth, asyncHandler(studyGuideController.getStudyMaterial));
router.get('/units/:id/review', requireAuth, asyncHandler(studyGuideController.getReview));

export { router as studyGuideRoutes };
