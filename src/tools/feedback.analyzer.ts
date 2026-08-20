import type { Correction } from '../schemas/tutor-response.schema';

const WORD_BOUNDARY = /[^a-zA-Z0-9'-]+/;

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(WORD_BOUNDARY)
    .filter((w) => w.length > 0);
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const curr = [i];
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1]! + 1, prev[j]! + 1, prev[j - 1]! + cost);
    }
    prev.splice(0, prev.length, ...curr);
  }
  return prev[n]!;
}

export function analyzeTurn(
  studentText: string,
  expectedText: string,
): { corrections: Correction[]; overallScore: number } {
  const studentWords = tokenize(studentText);
  const expectedWords = tokenize(expectedText);

  const corrections: Correction[] = [];
  const maxLen = Math.max(studentWords.length, expectedWords.length);

  for (let i = 0; i < maxLen; i++) {
    const s = studentWords[i];
    const e = expectedWords[i];

    if (s === undefined && e !== undefined) {
      corrections.push({
        original: '',
        corrected: e,
        explanation: `Falta la palabra "${e}".`,
        type: 'grammar',
      });
      continue;
    }
    if (s !== undefined && e === undefined) {
      corrections.push({
        original: s,
        corrected: '',
        explanation: `Sobra la palabra "${s}" en esta posición.`,
        type: 'grammar',
      });
      continue;
    }
    if (s !== undefined && e !== undefined && s !== e) {
      if (levenshtein(s, e) <= 1 && s.length > 1) {
        corrections.push({
          original: s,
          corrected: e,
          explanation: `"${s}" parece un error de escritura/pronunciación; la forma correcta es "${e}".`,
          type: 'pronunciation',
        });
      } else {
        corrections.push({
          original: s,
          corrected: e,
          explanation: `Se esperaba "${e}" en esta posición.`,
          type: 'vocabulary',
        });
      }
    }
  }

  const errorCount = corrections.length;
  const totalWords = Math.max(1, expectedWords.length);
  const score = Math.max(0, 10 - (errorCount / totalWords) * 10);

  return { corrections, overallScore: Math.round(score * 10) / 10 };
}
