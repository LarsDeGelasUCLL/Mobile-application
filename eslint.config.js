// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      'node_modules/**',
      '.expo/**',
      'dist/**',
      'web-build/**',
      'storybook-static/**',
      'src/types/database.types.ts',
      // Local agent tooling (gitignored), not app code.
      '.github/**',
      '.claude/**',
      '.planning/**',
      '.superpowers/**',
    ],
  },
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'never' }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
      'react-hooks/exhaustive-deps': 'error',
    },
  },
  {
    // These hooks start an async load from an effect; the rule cannot tell
    // that most of the state updates happen after an await.
    files: [
      'src/features/app/useServiceWorker.ts',
      'src/features/settings/useSettingsSaver.ts',
    ],
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
]);
