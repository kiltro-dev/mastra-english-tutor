import { describe, expect, it } from 'vitest';
import { OpencodeZenProvider } from '../src/llm/opencode-zen.provider';
import { resolveLlmProvider } from '../src/llm/resolve-llm-provider';

describe('OpencodeZenProvider', () => {
  it('creates a LanguageModel without throwing', () => {
    const provider = new OpencodeZenProvider({ apiKey: 'test-key' });
    expect(provider.id).toBe('opencode-zen');
    const model = provider.createModel();
    expect(model).toBeDefined();
  });

  it('respects model override', () => {
    const provider = new OpencodeZenProvider({
      apiKey: 'test-key',
      model: 'custom-model',
    });
    const model = provider.createModel();
    expect((model as unknown as { modelId: string }).modelId).toBe('custom-model');
  });
});

describe('resolveLlmProvider', () => {
  it('resolves opencode-zen by default when api key is present', () => {
    const provider = resolveLlmProvider({
      OPENCODE_ZEN_API_KEY: 'test-key',
    } as NodeJS.ProcessEnv);
    expect(provider.id).toBe('opencode-zen');
    expect(provider).toBeInstanceOf(OpencodeZenProvider);
  });

  it('throws with clear message when api key is missing', () => {
    expect(() => resolveLlmProvider({} as NodeJS.ProcessEnv)).toThrow(
      'OPENCODE_ZEN_API_KEY',
    );
  });

  it('throws for unknown LLM_PROVIDER', () => {
    expect(() =>
      resolveLlmProvider({
        LLM_PROVIDER: 'unknown-provider',
        OPENCODE_ZEN_API_KEY: 'test-key',
      } as unknown as NodeJS.ProcessEnv),
    ).toThrow('Unknown LLM_PROVIDER');
  });

  it('respects OPENCODE_ZEN_MODEL override via env', () => {
    const provider = resolveLlmProvider({
      OPENCODE_ZEN_API_KEY: 'test-key',
      OPENCODE_ZEN_MODEL: 'override-model',
    } as NodeJS.ProcessEnv);
    const model = provider.createModel();
    expect((model as unknown as { modelId: string }).modelId).toBe('override-model');
  });
});
