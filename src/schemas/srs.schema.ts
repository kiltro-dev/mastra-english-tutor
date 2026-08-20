import { z } from 'zod';

export const srsScheduleSchema = z.object({
  box: z
    .number()
    .int()
    .min(0)
    .max(5)
    .describe('Nivel SRS actual del ítem (0 = nuevo, 5 = dominado)'),
  reviewedAt: z.string().datetime().describe('Fecha ISO de la última revisión'),
});

export const srsScheduleInputSchema = srsScheduleSchema;

export const srsScheduleOutputSchema = z.object({
  nextReview: z.string().datetime().describe('Fecha ISO de la próxima revisión'),
  nextBox: z.number().int().describe('Nuevo nivel SRS del ítem'),
  intervalDays: z.number().int().describe('Días hasta la próxima revisión'),
});

// Ebbinghaus-inspired spaced repetition intervals (days), SM-2-like.
export const SRS_INTERVALS_DAYS: readonly number[] = [0, 1, 2, 4, 7, 15];

export function computeSrsSchedule(box: number, reviewedAt: string): SrsSchedule {
  const nextBox = Math.min(box + 1, SRS_INTERVALS_DAYS.length - 1);
  const intervalDays = SRS_INTERVALS_DAYS[nextBox] ?? 1;
  const reviewed = new Date(reviewedAt);
  const nextReview = new Date(reviewed.getTime() + intervalDays * 24 * 60 * 60 * 1000);
  return {
    nextReview: nextReview.toISOString(),
    nextBox,
    intervalDays,
  };
}

export type SrsSchedule = z.infer<typeof srsScheduleOutputSchema>;
