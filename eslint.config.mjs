import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist/', 'coverage/', 'node_modules/'] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.cjs', '**/*.mjs', '**/*.js'],
    languageOptions: {
      globals: { ...globals.node, ...globals.es2021 },
    },
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'warn',
    },
  },
  {
    files: ['src/tools/**/*.ts', 'src/llm/**/*.ts', 'evals/**/*.ts'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      'no-console': 'off',
    },
  },
  eslintConfigPrettier,
);
