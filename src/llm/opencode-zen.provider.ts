import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import type { LlmProvider } from './llm-provider';

export const OPENCODE_ZEN_BASE_URL = 'https://opencode.ai/zen/v1';
export const OPENCODE_ZEN_MODEL = 'nemotron-3-ultra-free';

export interface ZenConfig {
  apiKey: string;
  baseURL?: string;
  model?: string;
}

export function createZenModel(config: ZenConfig) {
  const client = createOpenAICompatible({
    name: 'opencode-zen',
    baseURL: config.baseURL ?? OPENCODE_ZEN_BASE_URL,
    apiKey: config.apiKey,
  });
  return client(config.model ?? OPENCODE_ZEN_MODEL);
}

export class OpencodeZenProvider implements LlmProvider<
  ReturnType<typeof createZenModel>
> {
  readonly id = 'opencode-zen' as const;

  constructor(private readonly config: ZenConfig) {}

  createModel() {
    return createZenModel(this.config);
  }
}
