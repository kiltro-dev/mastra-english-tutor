import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import * as dotenv from 'dotenv';
import { RequestContext } from '@mastra/core/request-context';
import { createEnglishTutorAgent } from '../agent/english-tutor.agent';
import { resolveLlmProvider } from '../llm/resolve-llm-provider';
import { formatTutorTurn, parseTutorReply } from './tutor-turn';

interface CliOptions {
  level?: string;
  topic?: string;
}

function parseArgs(argv: readonly string[]): CliOptions {
  const level = argv.includes('--level')
    ? argv[argv.indexOf('--level') + 1]
    : undefined;
  const topic = argv.includes('--topic')
    ? argv[argv.indexOf('--topic') + 1]
    : undefined;
  return {
    ...(level ? { level } : {}),
    ...(topic ? { topic } : {}),
  };
}

async function main(): Promise<void> {
  dotenv.config({ path: '.env' });

  let provider;
  try {
    provider = resolveLlmProvider();
  } catch (error) {
    console.error(
      `${error instanceof Error ? error.message : String(error)} Aborting tutor demo.`,
    );
    process.exit(1);
  }

  const { level, topic } = parseArgs(process.argv.slice(2));
  const agent = createEnglishTutorAgent({ model: provider.createModel() });

  const context = new RequestContext<{ level?: string; topic?: string }>();
  if (level) context.set('level', level);
  if (topic) context.set('topic', topic);

  console.log(
    [
      'English Tutor CLI — practice session',
      level ? `Level: ${level}` : null,
      topic ? `Topic: ${topic}` : null,
      'Type your message in English. Type "exit" to finish.\n',
    ]
      .filter((line) => line !== null)
      .join('\n'),
  );

  const rl = readline.createInterface({ input, output });
  try {
    for (;;) {
      const userMessage = await rl.question('You: ');
      if (!userMessage.trim()) continue;
      if (['exit', 'quit', ':q'].includes(userMessage.trim().toLowerCase())) {
        break;
      }

      try {
        const response = await agent.generate(userMessage, {
          requestContext: context,
        });
        const turn = parseTutorReply(response.text);
        console.log(`\n${turn ? formatTutorTurn(turn) : response.text}\n`);
      } catch (error) {
        console.error(
          `\n[error] The tutor could not respond: ${
            error instanceof Error ? error.message : String(error)
          }\n`,
        );
      }
    }
  } finally {
    rl.close();
    console.log('\nSession finished. See you next time!');
  }
}

void main();
