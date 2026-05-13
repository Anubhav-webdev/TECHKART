import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Proxy API calls to backend during development so fetch("/api/...") works
  server: {
    proxy: {
      '/api': {
        target: 'https://techkart-ava8.onrender.com',
        changeOrigin: true,
        secure: false,
      },
      // Also proxy asset requests (optional) if you serve static assets from backend
      '/assets': {
        target: 'https://techkart-ava8.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
