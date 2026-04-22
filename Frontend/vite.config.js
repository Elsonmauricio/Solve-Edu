import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        proxyTimeout: 15000, // Espera até 15s pelo backend
        timeout: 15000,
        // Adiciona esta linha se o teu backend tiver rotas como app.get('/problems') em vez de app.get('/api/problems')
        // Se o teu backend JÁ usa o prefixo /api, podes remover ou comentar a linha abaixo.
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }


})