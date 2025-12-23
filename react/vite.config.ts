import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'ZoompinchReact',
      formats: ['es', 'umd'],
      fileName: (format) => `zoompinch-react.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', '@zoompinch/core'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@zoompinch/core': 'ZoompinchCore',
        },
      },
    },
    
  },
});
