import { describe, expect, it } from 'vitest';
import { computeSrsSchedule } from '../src/schemas/srs.schema';

describe('computeSrsSchedule', () => {
  it('box 0 pasa a box 1 en 1 día', () => {
    const result = computeSrsSchedule(0, '2026-08-19T12:00:00.000Z');
    expect(result.nextBox).toBe(1);
    expect(result.intervalDays).toBe(1);
    expect(result.nextReview).toBe('2026-08-20T12:00:00.000Z');
  });

  it('box intermedio usa el intervalo correspondiente al nuevo box', () => {
    const result = computeSrsSchedule(2, '2026-08-19T12:00:00.000Z');
    expect(result.nextBox).toBe(3);
    expect(result.intervalDays).toBe(4);
  });

  it('no sube más allá del último box', () => {
    const result = computeSrsSchedule(5, '2026-08-19T12:00:00.000Z');
    expect(result.nextBox).toBe(5);
    expect(result.intervalDays).toBe(15);
  });
});
