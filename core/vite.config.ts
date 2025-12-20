import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'Zoompinch',
      formats: ['es', 'umd'],
      fileName: (format) => `zoompinch-core.${format}.js`
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {}
      }
    }
  },
  server: {
    host: true,
    open: true
  }
});
