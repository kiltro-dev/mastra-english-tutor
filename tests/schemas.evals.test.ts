import { describe, expect, it } from 'vitest';
import { TutorResponseSchema } from '../src/schemas/tutor-response.schema';
import { dictionaryInputSchema } from '../src/schemas/dictionary.schema';
import { srsScheduleSchema } from '../src/schemas/srs.schema';
import { checkContains, checkNotContains } from '../src/evals/tutor.evals';

describe('TutorResponseSchema', () => {
  it('parsea una respuesta válida', () => {
    const parsed = TutorResponseSchema.parse({
      reply_text: 'Great job!',
      corrections: [
        {
          original: 'goed',
          corrected: 'went',
          explanation: 'past of go',
          type: 'grammar',
        },
      ],
      pronunciation_score: 8,
      next_lesson: 'irregular past tense',
    });
    expect(parsed.reply_text).toBe('Great job!');
    expect(parsed.corrections).toHaveLength(1);
  });

  it('default recupera corrections vacías si no vienen', () => {
    const parsed = TutorResponseSchema.parse({ reply_text: 'Hi!' });
    expect(parsed.corrections).toEqual([]);
  });

  it('rechaza un tipo de corrección inválido', () => {
    expect(() =>
      TutorResponseSchema.parse({
        reply_text: 'x',
        corrections: [
          {
            original: 'goed',
            corrected: 'went',
            explanation: 'e',
            type: 'not-a-type',
          },
        ],
      }),
    ).toThrow();
  });
});

describe('schemas de input', () => {
  it('dictionary rechaza palabra vacía', () => {
    expect(() => dictionaryInputSchema.parse({ word: '' })).toThrow();
  });

  it('srs rechaza box fuera de rango', () => {
    expect(() =>
      srsScheduleSchema.parse({ box: 8, reviewedAt: '2026-08-19T00:00:00Z' }),
    ).toThrow();
  });
});

describe('eval helpers', () => {
  it('checkContains reporta lo que falta', () => {
    const missing = checkContains('went to the park', ['went', 'park', 'school']);
    expect(missing).toEqual(['school']);
  });

  it('checkNotContains reporta lo prohibido presente', () => {
    const bad = checkNotContains('went goed', ['goed']);
    expect(bad).toEqual(['goed']);
  });
});
