import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// const API = `${import.meta.env.VITE_BACKEND_URL}:${import.meta.env.VITE_BACKEND_PORT}/api` || "http://localhost:5000/api";


// const backendUrl = `${import.meta.env.VITE_BACKEND_URL}:${import.meta.env.VITE_BACKEND_PORT}`;
// console.log("Backend URL:", backendUrl); 
// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendUrl = `${env.VITE_BACKEND_URL}:${env.VITE_BACKEND_PORT}`;
  console.log("Backend URL:", backendUrl)

  return {

    // this is for accessing image for items from backend whithout cors problem
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
  }
})
