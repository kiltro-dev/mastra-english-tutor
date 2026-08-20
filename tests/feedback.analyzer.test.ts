import { describe, expect, it } from 'vitest';
import { analyzeTurn } from '../src/tools/feedback.analyzer';

describe('analyzeTurn', () => {
  it('devuelve corrección tipo pronunciation para error de escritura cercano', () => {
    const { corrections } = analyzeTurn(
      'I was writting a letter',
      'I was writing a letter',
    );
    const correction = corrections.find((c) => c.original === 'writting');
    expect(correction).toBeDefined();
    expect(correction?.type).toBe('pronunciation');
    expect(correction?.corrected).toBe('writing');
  });

  it('devuelve corrección tipo vocabulary cuando la palabra es distinta', () => {
    const { corrections } = analyzeTurn('I buyed a car', 'I bought a car');
    const correction = corrections.find((c) => c.original === 'buyed');
    expect(correction?.type).toBe('vocabulary');
    expect(correction?.corrected).toBe('bought');
  });

  it('detecta palabras faltantes', () => {
    const { corrections } = analyzeTurn('I went park', 'I went to the park');
    const missing = corrections.filter((c) => c.original === '');
    expect(missing.length).toBeGreaterThan(0);
  });

  it('texto perfecto = score 10 y sin correcciones', () => {
    const { corrections, overallScore } = analyzeTurn(
      'I went to the park',
      'I went to the park',
    );
    expect(corrections).toHaveLength(0);
    expect(overallScore).toBe(10);
  });

  it('un error en cuatro palabras baja el score', () => {
    const { overallScore } = analyzeTurn('I goed to park', 'I went to the park');
    expect(overallScore).toBeGreaterThan(0);
    expect(overallScore).toBeLessThan(10);
  });
});
