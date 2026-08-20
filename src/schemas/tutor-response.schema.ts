import { z } from 'zod';

export const CorrectionSchema = z.object({
  original: z.string().describe('La frase o palabra tal como la dijo el alumno'),
  corrected: z.string().describe('La forma correcta'),
  explanation: z.string().describe('Explicación breve y en lenguaje sencillo'),
  type: z
    .enum(['grammar', 'vocabulary', 'pronunciation', 'word-order'])
    .describe('Tipo de corrección'),
});

export const TutorResponseSchema = z.object({
  reply_text: z.string().describe('Respuesta directa del tutor al alumno'),
  corrections: z
    .array(CorrectionSchema)
    .default([])
    .describe('Correcciones detectadas en el turno actual'),
  pronunciation_score: z
    .number()
    .min(0)
    .max(10)
    .optional()
    .describe('Score de pronunciación 0-10 si fue evaluada'),
  next_lesson: z.string().optional().describe('Siguiente tema/ejercicio sugerido'),
});

export type TutorResponse = z.infer<typeof TutorResponseSchema>;
export type Correction = z.infer<typeof CorrectionSchema>;
