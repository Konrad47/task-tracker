import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import testingLibrary from 'eslint-plugin-testing-library';
import jestDom from 'eslint-plugin-jest-dom';
import vitest from '@vitest/eslint-plugin';

const specFiles = ['src/**/*.spec.ts', 'src/**/*.spec.tsx'];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  eslintPluginPrettierRecommended,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'coverage/**', 'next-env.d.ts', 'eslint.config.mjs']),
  {
    ...testingLibrary.configs['flat/react'],
    files: specFiles,
  },
  {
    ...jestDom.configs['flat/recommended'],
    files: specFiles,
  },
  {
    ...vitest.configs.recommended,
    files: specFiles,
  },
]);

export default eslintConfig;
