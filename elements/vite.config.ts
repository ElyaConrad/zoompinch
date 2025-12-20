import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'ZoompinchElements',
      formats: ['es', 'umd'],
      fileName: (format) => `zoompinch-elements.${format}.js`
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
