import { z } from 'zod';
import { questionSchema } from './question.schema';

export const lessonGenerationSchema = z.object({
  title: z.string(),
  questions: z.array(questionSchema).min(4).max(6),
});

export type AILessonGeneration = z.infer<typeof lessonGenerationSchema>;
