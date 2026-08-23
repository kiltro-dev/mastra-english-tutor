import * as dotenv from 'dotenv';
import { RequestContext } from '@mastra/core/request-context';
import { createEnglishTutorAgent } from '../src/agent/english-tutor.agent';
import { EVAL_CASES, evaluateTutorOutput, runEvalCase } from '../src/evals/tutor.evals';
import { resolveLlmProvider } from '../src/llm/resolve-llm-provider';
import { TutorResponseSchema } from '../src/schemas/tutor-response.schema';

dotenv.config({ path: '.env' });

async function main() {
  let provider;
  try {
    provider = resolveLlmProvider();
  } catch (error) {
    console.error(
      `${error instanceof Error ? error.message : String(error)} Aborting evals.`,
    );
    process.exit(1);
  }

  const agent = createEnglishTutorAgent({ model: provider.createModel() });

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
        let parsed: unknown = output;
        if (typeof output === 'string') {
          try {
            parsed = TutorResponseSchema.parse(JSON.parse(output));
          } catch {
            parsed = output;
          }
        }
        return evaluateTutorOutput(evalCase, parsed);
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
