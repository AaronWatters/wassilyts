
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
  plugins: [dts()]
});
