import type { LlmProvider } from './llm-provider';
import { OpencodeZenProvider, type createZenModel } from './opencode-zen.provider';

export function resolveLlmProvider(
  env: NodeJS.ProcessEnv = process.env,
): LlmProvider<ReturnType<typeof createZenModel>> {
  const providerId = env.LLM_PROVIDER ?? 'opencode-zen';
  switch (providerId) {
    case 'opencode-zen': {
      const apiKey = env.OPENCODE_ZEN_API_KEY;
      if (!apiKey) {
        throw new Error('OPENCODE_ZEN_API_KEY is not configured (.env). Aborting.');
      }
      return new OpencodeZenProvider({
        apiKey,
        ...(env.OPENCODE_ZEN_BASE_URL ? { baseURL: env.OPENCODE_ZEN_BASE_URL } : {}),
        ...(env.OPENCODE_ZEN_MODEL ? { model: env.OPENCODE_ZEN_MODEL } : {}),
      });
    }
    default:
      throw new Error(`Unknown LLM_PROVIDER: ${providerId}`);
  }
}

export function resolveLlmModel(env: NodeJS.ProcessEnv = process.env) {
  return resolveLlmProvider(env).createModel();
}
