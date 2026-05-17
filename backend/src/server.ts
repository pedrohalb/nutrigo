import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler';
import { authRoutes } from './modules/auth/auth.routes';
import { profileRoutes } from './modules/profile/profile.routes';
import { unitsRoutes } from './modules/units/units.routes';
import { lessonsRoutes } from './modules/lessons/lessons.routes';
import { studyGuideRoutes } from './modules/studyGuide/studyGuide.routes';
import { chatRoutes } from './modules/chat/chat.routes';
import { challengesRoutes } from './modules/challenges/challenges.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api', profileRoutes);
app.use('/api', unitsRoutes);
app.use('/api', lessonsRoutes);
app.use('/api', studyGuideRoutes);
app.use('/api', chatRoutes);
app.use('/api', challengesRoutes);

app.use(errorHandler);

export { app };
