import { z } from 'zod';
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
      minScore: 5,
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

export async function defaultEvaluator(
  _input: string,
  output: unknown,
): Promise<EvalResult> {
  const parsed = z.unknown().safeParse(output);
  if (!parsed.success) {
    return {
      id: 'unknown',
      name: 'output no parseable',
      pass: false,
      errors: ['El output no es un objeto válido'],
    };
  }

  const schema = TutorResponseSchema.safeParse(output);
  if (!schema.success) {
    return {
      id: 'unknown',
      name: 'schema inválido',
      pass: false,
      errors: schema.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      ),
    };
  }

  return {
    id: 'unknown',
    name: 'ok',
    pass: true,
    errors: [],
  };
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
