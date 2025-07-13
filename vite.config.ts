import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2020',
    sourcemap: true,
  },
  server: {
    port: 3000,
    open: true
  },
  optimizeDeps: {
    include: ['fabric', 'tone']
  }
});