import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'ZoomPinch',
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
