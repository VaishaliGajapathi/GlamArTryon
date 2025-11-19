import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'client/src/plugin/index.tsx'),
      name: 'GlamAR',
      fileName: 'plugin',
      formats: ['iife'],
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {},
      },
    },
    outDir: 'dist/plugin',
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
});
