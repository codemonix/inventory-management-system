import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/uploads': {
        target: backendUrl,
        changeOrigin: true,
      }
    }
  },
  plugins: [
    react(),
    tailwindcss()],
})
