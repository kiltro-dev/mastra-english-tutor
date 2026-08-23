import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80,
      },
      include: ['src/**/*.ts'],
      exclude: [
        'src/index.ts',
        'src/cli/main.ts',
        'src/evals/**',
        'src/agent/**',
        'src/llm/**',
        'src/tools/dictionary.tool.ts',
        'src/tools/feedback.tool.ts',
        'src/tools/srs-schedule.tool.ts',
      ],
    },
  },
});
