
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['test/**/*.test.ts'],
    environment: 'node',
    coverage: {
      provider: 'v8', // or 'c8'
      reportsDirectory: './coverage',
      include: ['src/**/*.ts'], // Only cover your library source files
      exclude: ['**/*.test.ts', '**/__tests__/**', '**/node_modules/**'],
    },
  },
});
