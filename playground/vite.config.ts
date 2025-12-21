import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [
    vue({
      template: {
        // compilerOptions: {
        //   isCustomElement: (tag) => ['pan-cake'].includes(tag),
        // },
      },
    }),
  ],
  optimizeDeps: {
    exclude: ['@zoompinch/vue', '@zoompinch/core'],
  },
});
