/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        'docs/',
        '**/*.d.ts',
        '**/*.config.ts',
        '**/*.config.js',
        'examples/',
        '.github/',
        'vitest.config.ts',
        'vitest.setup.ts',
      ],
      thresholds: {
        global: {
          branches: 100,
          functions: 100,
          lines: 100,
          statements: 100,
        },
      },
    },
    include: ['packages/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', 'docs'],
  },
  resolve: {
    alias: {
      '@gftd/bpmn-sdk/core': resolve('./packages/core/src'),
      '@gftd/bpmn-sdk/dsl': resolve('./packages/dsl/src'),
      '@gftd/bpmn-sdk/compiler': resolve('./packages/compiler/src'),
      '@gftd/bpmn-sdk/runtime': resolve('./packages/runtime/src'),
      '@gftd/bpmn-sdk/importer': resolve('./packages/importer/src'),
      '@gftd/bpmn-sdk/human': resolve('./packages/human/src'),
      '@gftd/bpmn-sdk/validation': resolve('./packages/validation/src'),
      '@gftd/bpmn-sdk/testing': resolve('./packages/testing/src'),
      '@gftd/bpmn-sdk/ops': resolve('./packages/ops/src'),
    },
  },
});
