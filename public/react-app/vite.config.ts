import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // En build (production Apache), on sert le SPA depuis /react/ pour que les
  // assets soient des fichiers reels (public/react/assets/*) et eviter toute
  // collision avec les assets legacy de public/assets. En dev, on reste a la racine.
  base: command === 'build' ? '/react/' : '/',
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: '../react',
    emptyOutDir: true,
  },
}));
