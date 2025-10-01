import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5177,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api/v1'),
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      '@tanstack/react-query',
      '@tanstack/query-core'
    ],
  },
  define: {
    global: 'globalThis',
  },
  esbuild: {
    jsx: 'automatic',
  },
})