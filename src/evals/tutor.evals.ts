import {
  CorrectionSchema,
  TutorResponseSchema,
} from '../schemas/tutor-response.schema';

export interface EvalCase {
  id: string;
  name: string;
  level: string;
  topic?: string;
  input: string;
  expected: {
    mustContain: string[];
    mustNotContain: string[];
    minScore?: number;
  };
}

export const EVAL_CASES: EvalCase[] = [
  {
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
  },
  {
    id: 'vocabulary-basic',
    name: 'da definición clara',
    level: 'A1',
    input: 'What does "apple" mean?',
    expected: {
      mustContain: ['apple'],
      mustNotContain: [],
    },
  },
];

export interface EvalResult {
  id: string;
  name: string;
  pass: boolean;
  errors: string[];
}

export async function runEvalCase(
  generate: (input: string) => Promise<unknown>,
  evaluator: (input: string, output: unknown) => Promise<EvalResult>,
  evalCase: EvalCase,
): Promise<EvalResult> {
  const output = await generate(evalCase.input);
  return evaluator(evalCase.input, output);
}

export function validateCorrectionShape(correction: unknown): boolean {
  return CorrectionSchema.safeParse(correction).success;
}

export function checkContains(text: string, mustContain: string[]): string[] {
  return mustContain.filter(
    (needle) => !text.toLowerCase().includes(needle.toLowerCase()),
  );
}

export function checkNotContains(text: string, mustNotContain: string[]): string[] {
  return mustNotContain.filter((needle) =>
    text.toLowerCase().includes(needle.toLowerCase()),
  );
}

/**
 * Evalúa el output estructurado del tutor contra un caso de eval.
 * - mustContain: se busca en reply_text y en corrections[].corrected
 *   (el tutor debe producir la forma correcta en alguna de esas partes).
 * - mustNotContain: solo sobre reply_text; corrections[].original cita el
 *   error del alumno por diseño, por lo que no debe evaluarse ahí.
 */
export function evaluateTutorOutput(evalCase: EvalCase, output: unknown): EvalResult {
  const parsed = TutorResponseSchema.safeParse(output);
  if (!parsed.success) {
    return {
      id: evalCase.id,
      name: evalCase.name,
      pass: false,
      errors: parsed.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      ),
    };
  }

  const { reply_text, corrections, pronunciation_score } = parsed.data;
  const producedText = [reply_text, ...corrections.map((c) => c.corrected)].join('\n');

  const errors = [
    ...checkContains(producedText, evalCase.expected.mustContain).map(
      (n) => `falta "${n}"`,
    ),
    ...checkNotContains(reply_text, evalCase.expected.mustNotContain).map(
      (n) => `no debería contener "${n}"`,
    ),
  ];

  if (
    evalCase.expected.minScore !== undefined &&
    (pronunciation_score === undefined ||
      pronunciation_score < evalCase.expected.minScore)
  ) {
    errors.push(
      `pronunciation_score ${
        pronunciation_score ?? 'ausente'
      } < mínimo esperado ${evalCase.expected.minScore}`,
    );
  }

  return {
    id: evalCase.id,
    name: evalCase.name,
    pass: errors.length === 0,
    errors,
  };
}
