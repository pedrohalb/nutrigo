import { z } from 'zod';

export const unitSummarySchema = z.object({
  summary: z.string().min(10).max(500),
});

export type AIUnitSummary = z.infer<typeof unitSummarySchema>;
