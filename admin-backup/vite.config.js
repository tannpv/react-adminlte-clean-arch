import { defineConfig } from 'vite'

// Minimal Vite config with a dev proxy to avoid CORS and extension blocking
export default defineConfig({
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
