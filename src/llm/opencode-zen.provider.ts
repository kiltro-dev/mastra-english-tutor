import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

export const OPENCODE_ZEN_BASE_URL = 'https://opencode.ai/zen/v1';
export const OPENCODE_ZEN_MODEL = 'deepseek-v4-flash-free';

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
