import { z } from 'zod';

export const dictionaryInputSchema = z.object({
  word: z.string().min(1).describe('La palabra a definir'),
});

export const dictionaryOutputSchema = z.object({
  word: z.string(),
  definition: z.string(),
  example: z.string(),
  partOfSpeech: z.string().optional(),
});

export type DictionaryEntry = z.infer<typeof dictionaryOutputSchema>;
