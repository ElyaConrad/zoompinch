import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true
    })
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'ZoompinchVue',
      formats: ['es', 'umd'],
      fileName: (format) => `zoompinch-vue.${format}.js`
    },
    cssCodeSplit: false,
    rollupOptions: {
      external: ['vue', '@zoompinch/core'],
      output: {
        globals: {
          vue: 'Vue',
          '@zoompinch/core': 'ZoompinchCore'
        },
        assetFileNames: (assetInfo) => {
        if (assetInfo.name && assetInfo.names.some(name => name.search('.css'))) {
          return 'style.css';
        }
        return assetInfo.name!;
      }
      },
      
      
    },
    
    
  }
});
