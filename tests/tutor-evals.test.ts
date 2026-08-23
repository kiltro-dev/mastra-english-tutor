import { describe, expect, it } from 'vitest';
import { evaluateTutorOutput } from '../src/evals/tutor.evals';
import type { EvalCase } from '../src/evals/tutor.evals';

const evalCase: EvalCase = {
  id: 'grammar-past-simple',
  name: 'corrige error de pasado simple',
  level: 'A2',
  topic: 'daily routine',
  input: 'Yesterday I go to the park',
  expected: {
    mustContain: ['went'],
    mustNotContain: ['go to the park'],
    minScore: 7,
  },
};

const validOutput = {
  reply_text:
    "Great job! For yesterday, we use 'went'. Try: 'Yesterday I went to the park.'",
  corrections: [
    {
      original: 'Yesterday I go to the park',
      corrected: 'Yesterday I went to the park.',
      explanation: 'Use past simple for finished actions.',
      type: 'grammar',
    },
  ],
  pronunciation_score: 8,
  next_lesson: 'Past simple irregular verbs',
};

describe('evaluateTutorOutput', () => {
  it('does not flag quoted errors from corrections.original (false positive)', () => {
    const result = evaluateTutorOutput(evalCase, validOutput);
    expect(result.pass).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('fails when mustContain is missing from reply and corrected fields', () => {
    const output = {
      ...validOutput,
      reply_text: 'Nice try! Keep practicing.',
      corrections: [
        {
          original: 'Yesterday I go to the park',
          corrected: 'Yesterday I walked to the park.',
          explanation: 'Past tense needed.',
          type: 'grammar',
        },
      ],
    };
    const result = evaluateTutorOutput(evalCase, output);
    expect(result.pass).toBe(false);
    expect(result.errors).toContain('falta "went"');
  });

  it('fails when reply_text itself repeats the forbidden phrase', () => {
    const output = {
      ...validOutput,
      reply_text: 'You said: yesterday I go to the park. Not quite!',
    };
    const result = evaluateTutorOutput(evalCase, output);
    expect(result.pass).toBe(false);
    expect(result.errors).toContain('no debería contener "go to the park"');
  });

  it('returns schema errors for invalid output', () => {
    const result = evaluateTutorOutput(evalCase, { reply_text: 42 });
    expect(result.pass).toBe(false);
    expect(result.id).toBe('grammar-past-simple');
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('checks minScore against pronunciation_score when present', () => {
    const output = { ...validOutput, pronunciation_score: 4 };
    const result = evaluateTutorOutput(evalCase, output);
    expect(result.pass).toBe(false);
    expect(result.errors.join(' ')).toContain('pronunciation_score');
  });
});
