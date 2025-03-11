
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    minify: false, // Disable minification
    lib: {
      entry: 'src/index.ts',
      name: 'wassilyts',
      fileName: 'wassilyts',
      formats: ['es', 'cjs', 'umd']
    }
  },
  test: {
    environment: "jsdom", // 👈 Ensures a browser-like environment
    setupFiles: "./tests/vitest.setup.ts", // 👈 Runs the setup before tests
    globals: true,
  },
  plugins: [dts()]
});
