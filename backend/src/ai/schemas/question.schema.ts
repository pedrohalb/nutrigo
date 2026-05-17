import { z } from 'zod';

export const multipleChoiceSchema = z.object({
  type: z.literal('multiple-choice'),
  question: z.string(),
  options: z.array(z.string()).min(2).max(5),
  correctIndex: z.number().int().min(0),
  explanation: z.string(),
});

export const imageChoiceSchema = z.object({
  type: z.literal('image-choice'),
  question: z.string(),
  options: z.array(z.object({ label: z.string(), emoji: z.string() })).min(2).max(5),
  correctIndex: z.number().int().min(0),
  explanation: z.string(),
});

export const fillBlankSchema = z.object({
  type: z.literal('fill-blank'),
  question: z.string(),
  chips: z.array(z.string()).min(2).max(8),
  correctChip: z.string(),
  explanation: z.string(),
});

export const questionSchema = z.discriminatedUnion('type', [
  multipleChoiceSchema,
  imageChoiceSchema,
  fillBlankSchema,
]);

export type AIQuestion = z.infer<typeof questionSchema>;
