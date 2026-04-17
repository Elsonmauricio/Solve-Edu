import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
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