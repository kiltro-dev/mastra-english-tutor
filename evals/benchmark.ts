import * as dotenv from 'dotenv';
import { RequestContext } from '@mastra/core/request-context';
import { createEnglishTutorAgent } from '../src/agent/english-tutor.agent';
import { EVAL_CASES, evaluateTutorOutput } from '../src/evals/tutor.evals';
import type { EvalCase } from '../src/evals/tutor.evals';

dotenv.config({ path: '.env' });

const MODELS = [
  'x-preview-f-free',
  'mimo-v2.5-free',
  'hy3-free',
  'nemotron-3-ultra-free',
  'nemotron-3.5-lightning-free',
  'big-pickle',
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function generateWithRetry(
  agent: ReturnType<typeof createEnglishTutorAgent>,
  input: string,
  ctx: RequestContext<{ level?: string; topic?: string }>,
): Promise<{ text: string | null; attempts: number; error?: string }> {
  let attempts = 0;
  let lastError = '';
  while (attempts < 3) {
    attempts++;
    try {
      const res = await agent.generate(input, { requestContext: ctx });
      return { text: res.text, attempts };
    } catch (err) {
      lastError =
        err instanceof Error ? (err.message.split('\n')[0] ?? '') : String(err);
      await sleep(2000 * attempts);
    }
  }
  return { text: null, attempts, error: lastError.slice(0, 120) };
}

async function main() {
  const apiKey = process.env.OPENCODE_ZEN_API_KEY;
  if (!apiKey) {
    console.error('OPENCODE_ZEN_API_KEY no configurada');
    process.exit(1);
  }

  interface Row {
    model: string;
    caseId: string;
    pass: boolean;
    seconds: number;
    attempts: number;
    error?: string | undefined;
  }
  const rows: Row[] = [];

  for (const model of MODELS) {
    const agent = createEnglishTutorAgent({ apiKey, model });
    console.log(`\n=== ${model} ===`);
    for (const evalCase of EVAL_CASES) {
      const ctx = new RequestContext<{ level?: string; topic?: string }>();
      if (evalCase.level) ctx.set('level', evalCase.level);
      if (evalCase.topic) ctx.set('topic', evalCase.topic);

      const start = Date.now();
      const { text, attempts, error } = await generateWithRetry(
        agent,
        evalCase.input,
        ctx,
      );
      const seconds = (Date.now() - start) / 1000;

      if (text === null) {
        rows.push({
          model,
          caseId: evalCase.id,
          pass: false,
          seconds,
          attempts,
          error,
        });
        console.log(
          `  ERROR [${evalCase.id}] ${seconds.toFixed(1)}s (${attempts} intentos): ${error}`,
        );
        continue;
      }

      let parsed: unknown = text;
      try {
        parsed = JSON.parse(text);
      } catch {
        // leave raw string; evaluator will report schema errors
      }
      const result = evaluateTutorOutput(evalCase as EvalCase, parsed);
      rows.push({ model, caseId: evalCase.id, pass: result.pass, seconds, attempts });
      console.log(
        `  ${result.pass ? 'PASS' : 'FAIL'} [${evalCase.id}] ${seconds.toFixed(1)}s${result.errors.length ? ' ✗ ' + result.errors.join('; ') : ''}`,
      );
    }
  }

  console.log('\n===== RESUMEN =====');
  for (const model of MODELS) {
    const rs = rows.filter((r) => r.model === model);
    const passed = rs.filter((r) => r.pass).length;
    const totalSec = rs.reduce((acc, r) => acc + r.seconds, 0);
    const retries = rs.reduce((acc, r) => acc + (r.attempts - 1), 0);
    console.log(
      `${model.padEnd(28)} ${passed}/${rs.length} pass · ${totalSec.toFixed(1)}s total · ${retries} retries`,
    );
  }
}

void main();
