import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'





const backendUrl = "http://localhost:5000";
console.log("Backend URL:", backendUrl); // Log the backend URL to check if it's being retrieved correctly

// https://vite.dev/config/
export default defineConfig({
  // this is for accessing imade for items from backend whithout cors problem
  server: {
    host: true,
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
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  },
})
