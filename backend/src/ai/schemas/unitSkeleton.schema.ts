import { z } from 'zod';

export const unitSkeletonSchema = z.object({
  units: z
    .array(
      z.object({
        section: z.number().int().min(1),
        unitNumber: z.number().int().min(1),
        title: z.string(),
      })
    )
    .min(6)
    .max(8),
});

export type AIUnitSkeleton = z.infer<typeof unitSkeletonSchema>;
