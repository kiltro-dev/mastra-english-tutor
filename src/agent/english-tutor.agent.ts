import { Agent } from '@mastra/core/agent';
import { z } from 'zod';
import { createZenModel } from '../llm/opencode-zen.provider';
import { createDictionaryTool } from '../tools/dictionary.tool';
import { createFeedbackTool } from '../tools/feedback.tool';
import { createSrsScheduleTool } from '../tools/srs-schedule.tool';
import type { DictionaryEntry, DictionaryLookupFn } from '../tools/dictionary.tool';

export interface EnglishTutorAgentDeps {
  apiKey: string;
  dictionaryLookup?: DictionaryLookupFn;
  baseURL?: string;
  model?: string;
}

export function createEnglishTutorAgent(deps: EnglishTutorAgentDeps): Agent {
  const dictionaryLookup =
    deps.dictionaryLookup ??
    ((word: string): Promise<DictionaryEntry> => fallbackDictionaryLookup(word));

  const agent = new Agent({
    id: 'english-tutor',
    name: 'English Tutor',
    description:
      'Tutor de inglés que escucha al alumno, corrige errores de forma amable y propone ejercicios de práctica.',
    requestContextSchema: z.object({
      level: z.string().optional(),
      topic: z.string().optional(),
    }),
    instructions: ({ requestContext }): string => {
      const level = (requestContext?.get('level') as string | null) ?? 'A2';
      const topic = (requestContext?.get('topic') as string | null) ?? null;

      return [
        'Eres un tutor de inglés paciente y motivador.',
        `Nivel del alumno: ${level}.`,
        topic ? `Tema de la sesión: ${topic}.` : null,
        '',
        'Reglas:',
        '- Responde en inglés, en frases cortas y claras acordes al nivel.',
        '- Corrige máximo 2-3 errores por turno, con explicación breve y amable.',
        '- Usa la tool dictionary para definir palabras nuevas.',
        '- Usa la tool feedback para analizar la respuesta del alumno contra una referencia.',
        '- Usa la tool srs-schedule para planificar la próxima revisión del contenido.',
        'Devuelve SIEMPRE un JSON válido con esta forma:',
        '{"reply_text": "...", "corrections": [{"original": "...", "corrected": "...", "explanation": "...", "type": "grammar|vocabulary|pronunciation|word-order"}], "pronunciation_score": 0-10, "next_lesson": "..."}',
      ]
        .filter((l) => l !== null)
        .join('\n');
    },
    model: createZenModel({
      apiKey: deps.apiKey,
      ...(deps.baseURL ? { baseURL: deps.baseURL } : {}),
      ...(deps.model ? { model: deps.model } : {}),
    }),
    tools: {
      dictionary: createDictionaryTool(dictionaryLookup),
      feedback: createFeedbackTool(),
      srsSchedule: createSrsScheduleTool(),
    },
  });
  return agent;
}

export type EnglishTutorAgent = ReturnType<typeof createEnglishTutorAgent>;

export async function fallbackDictionaryLookup(word: string): Promise<DictionaryEntry> {
  const response = await fetch(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
    { signal: AbortSignal.timeout(5000) },
  );
  if (!response.ok) {
    throw new Error(`No se encontró definición para "${word}"`);
  }
  const data = (await response.json()) as Array<{
    word: string;
    meanings?: Array<{
      partOfSpeech?: string;
      definitions?: Array<{ definition?: string; example?: string }>;
    }>;
  }>;
  const first = data[0];
  const meaning = first?.meanings?.[0];
  const def = meaning?.definitions?.[0];

  return {
    word: first?.word ?? word,
    definition: def?.definition ?? 'Definición no disponible',
    example: def?.example ?? '',
    partOfSpeech: meaning?.partOfSpeech,
  };
}
