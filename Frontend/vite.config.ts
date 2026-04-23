import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', '@auth0/auth0-react'],
          icons: ['lucide-react'],
          payments: ['@paypal/react-paypal-js'],
          ui: ['framer-motion', 'react-hot-toast']
        }
      }
    }
  }
});