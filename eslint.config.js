const { defineConfig } = require('eslint/config');
const expoFlat = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoFlat,
  { ignores: ['dist/*', 'ios/*', 'android/*', '.expo/*'] },
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
]);
