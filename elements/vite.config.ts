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
      external: ['@zoompinch/core'],
      output: {
        globals: {
          '@zoompinch/core': 'ZoompinchCore'
        }
      }
    }
  },
  server: {
    host: true,
    open: true
  }
});
