import { describe, expect, it } from 'vitest';
import { formatTutorTurn, parseTutorReply } from '../src/cli/tutor-turn';

describe('parseTutorReply', () => {
  it('parses a plain JSON object', () => {
    const raw = JSON.stringify({
      reply_text: 'Great job!',
      corrections: [],
      next_lesson: 'past simple',
    });

    const turn = parseTutorReply(raw);

    expect(turn).toEqual({
      reply_text: 'Great job!',
      corrections: [],
      next_lesson: 'past simple',
    });
  });

  it('parses JSON wrapped in markdown fences', () => {
    const json = JSON.stringify({
      reply_text: 'Almost there!',
      corrections: [
        {
          original: 'I go yesterday',
          corrected: 'I went yesterday',
          explanation: 'Use past simple for finished actions.',
          type: 'grammar',
        },
      ],
    });
    const raw = ['Here is my feedback:', '```json', json, '```'].join('\n');

    const turn = parseTutorReply(raw);

    expect(turn?.reply_text).toBe('Almost there!');
    expect(turn?.corrections).toHaveLength(1);
  });

  it('applies the corrections default when missing', () => {
    const raw = JSON.stringify({ reply_text: 'Well done!' });

    const turn = parseTutorReply(raw);

    expect(turn?.corrections).toEqual([]);
  });

  it('returns null for invalid JSON', () => {
    expect(parseTutorReply('not json at all')).toBeNull();
  });

  it('returns null when the payload violates the schema', () => {
    const raw = JSON.stringify({
      corrections: [{ original: 'x' }],
    });

    expect(parseTutorReply(raw)).toBeNull();
  });
});

describe('formatTutorTurn', () => {
  it('includes the tutor reply', () => {
    const output = formatTutorTurn({
      reply_text: 'Nice try!',
      corrections: [],
    });

    expect(output).toContain('Nice try!');
  });

  it('lists each correction as original -> corrected with explanation', () => {
    const output = formatTutorTurn({
      reply_text: 'Good.',
      corrections: [
        {
          original: 'I go yesterday',
          corrected: 'I went yesterday',
          explanation: 'Use past simple.',
          type: 'grammar',
        },
      ],
    });

    expect(output).toContain('I go yesterday');
    expect(output).toContain('I went yesterday');
    expect(output).toContain('Use past simple.');
  });

  it('shows the pronunciation score only when present', () => {
    const withScore = formatTutorTurn({
      reply_text: 'ok',
      corrections: [],
      pronunciation_score: 8,
    });
    const withoutScore = formatTutorTurn({
      reply_text: 'ok',
      corrections: [],
    });

    expect(withScore).toContain('8/10');
    expect(withoutScore).not.toContain('/10');
  });

  it('suggests the next lesson when present', () => {
    const output = formatTutorTurn({
      reply_text: 'ok',
      corrections: [],
      next_lesson: 'irregular verbs',
    });

    expect(output).toContain('irregular verbs');
  });
});
