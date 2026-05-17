import { z } from 'zod';
import { questionSchema } from './question.schema';

const studyMaterialSchema = z.object({
  sections: z.array(
    z.object({
      title: z.string(),
      content: z.string(),
    })
  ),
});

const lessonSchema = z.object({
  orderIndex: z.number().int().min(0),
  title: z.string(),
  questions: z.array(questionSchema).min(4).max(6),
});

export const unitWithLessonOneSchema = z.object({
  studyMaterial: studyMaterialSchema,
  lessons: z.array(lessonSchema).min(3).max(5),
});

export type AIUnitWithLessonOne = z.infer<typeof unitWithLessonOneSchema>;
export type AIStudyMaterial = z.infer<typeof studyMaterialSchema>;
export type AILesson = z.infer<typeof lessonSchema>;
