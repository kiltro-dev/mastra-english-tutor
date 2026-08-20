import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { CorrectionSchema } from '../schemas/tutor-response.schema';
import { analyzeTurn } from './feedback.analyzer';

const feedbackInputSchema = z.object({
  studentText: z.string().describe('Lo que dijo/escribió el alumno'),
  expectedText: z.string().describe('La respuesta esperada/referencia'),
});

const feedbackOutputSchema = z.object({
  corrections: z.array(CorrectionSchema),
  overallScore: z.number().min(0).max(10),
});

export function createFeedbackTool() {
  return createTool({
    id: 'feedback',
    description:
      'Compara la respuesta del alumno contra la referencia y devuelve correcciones estructuradas con score.',
    inputSchema: feedbackInputSchema,
    outputSchema: feedbackOutputSchema,
    execute: async ({ studentText, expectedText }) => {
      return analyzeTurn(studentText, expectedText);
    },
  });
}
