import { createTool } from '@mastra/core/tools';
import {
  dictionaryInputSchema,
  dictionaryOutputSchema,
} from '../schemas/dictionary.schema';
import type { DictionaryEntry } from '../schemas/dictionary.schema';

export type DictionaryLookupFn = (word: string) => Promise<DictionaryEntry>;

export type { DictionaryEntry };

export function createDictionaryTool(lookupWord: DictionaryLookupFn) {
  return createTool({
    id: 'dictionary',
    description: 'Busca la definición y un ejemplo de uso de una palabra en inglés.',
    inputSchema: dictionaryInputSchema,
    outputSchema: dictionaryOutputSchema,
    execute: async ({ word }) => lookupWord(word),
  });
}
