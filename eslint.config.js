const { defineConfig } = require('eslint/config');
const expoFlat = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoFlat,
  { ignores: ['dist/*', 'ios/*', 'android/*', '.expo/*'] },
  // Metro requires static require() for bundled image assets.
  { files: ['src/constants/packs.ts'], rules: { '@typescript-eslint/no-require-imports': 'off' } },
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
]);
