import * as dotenv from 'dotenv';
import { RequestContext } from '@mastra/core/request-context';
import { createEnglishTutorAgent } from '../src/agent/english-tutor.agent';
import { EVAL_CASES, runEvalCase } from '../src/evals/tutor.evals';
import type { EvalCase, EvalResult } from '../src/evals/tutor.evals';

dotenv.config({ path: '.env' });

async function main() {
  const apiKey = process.env.OPENCODE_ZEN_API_KEY;
  if (!apiKey) {
    console.error('OPENCODE_ZEN_API_KEY no está configurada (.env). Abortando evals.');
    process.exit(1);
  }

  const options = { apiKey };
  const agent = createEnglishTutorAgent(options);

  const buildResult = (evalCase: EvalCase, text: string): EvalResult => {
    const missing = evalCase.expected.mustContain.filter(
      (needle: string) => !text.toLowerCase().includes(needle.toLowerCase()),
    );
    const forbidden = evalCase.expected.mustNotContain.filter((needle: string) =>
      text.toLowerCase().includes(needle.toLowerCase()),
    );
    const errors = [
      ...missing.map((n: string) => `falta "${n}"`),
      ...forbidden.map((n: string) => `no debería contener "${n}"`),
    ];
    return {
      id: evalCase.id,
      name: evalCase.name,
      pass: errors.length === 0,
      errors,
    };
  };

  let passed = 0;
  for (const evalCase of EVAL_CASES) {
    const result = await runEvalCase(
      async (input) => {
        const context = new RequestContext<{ level?: string; topic?: string }>();
        if (evalCase.level) context.set('level', evalCase.level);
        if (evalCase.topic) context.set('topic', evalCase.topic);
        const res = await agent.generate(input, { requestContext: context });
        return res.text;
      },
      async (_input, output) => {
        return buildResult(evalCase, JSON.stringify(output));
      },
      evalCase,
    );

    passed += result.pass ? 1 : 0;
    console.log(`${result.pass ? 'PASS' : 'FAIL'} [${result.id}] ${result.name}`);
    result.errors.forEach((e: string) => console.log(`       ✗ ${e}`));
  }

  console.log(`\n${passed}/${EVAL_CASES.length} evals pasados.`);
  process.exit(passed === EVAL_CASES.length ? 0 : 1);
}

void main();
