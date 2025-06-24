import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000,
    open: true,
    strictPort: true,
    hmr: {
      overlay: false
    }
  },
  css: {
    postcss: './postcss.config.cjs',
    devSourcemap: true,
    preprocessorOptions: {
      scss: {
        additionalData: `@import "./src/index.css";`
      }
    }
  },
  optimizeDeps: {
    include: ['tailwindcss-animate']
  }
});
