import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src/**/*'],
      insertTypesEntry: true,
    })
  ],
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