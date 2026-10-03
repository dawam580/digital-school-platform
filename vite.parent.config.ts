import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * بناء تطبيق ولي الأمر (PWA مستقل) ← dist-parent/ — يقدّمه خادم المورّد server/parent-relay.mjs.
 * منفصل تماماً عن منظومة المدرسة: لا يحوي شاشات الإدارة ولا قاعدة البيانات المحلية.
 */
export default defineConfig({
  root: path.resolve(__dirname, 'parent-app'),
  base: './',
  publicDir: path.resolve(__dirname, 'parent-app/public'),
  plugins: [react()],
  resolve: { alias: { '/src': path.resolve(__dirname, 'src') } },
  build: {
    outDir: path.resolve(__dirname, 'dist-parent'),
    emptyOutDir: true,
    chunkSizeWarningLimit: 800,
  },
  server: { port: 5174, fs: { allow: [__dirname] } },
});
