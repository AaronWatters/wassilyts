
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: "./test/vitest.setup.ts", // 👈 Register global setup
    globals: true,
    include: ['test/**/*.test.ts'],
    environment: "jsdom", // 👈 Ensures a browser-like environment
    coverage: {
      provider: 'v8', // or 'c8'
      reportsDirectory: './coverage',
      include: ['src/**/*.ts'], // Only cover your library source files
      exclude: ['**/*.test.ts', '**/__tests__/**', '**/node_modules/**'],
    },
  },
});
