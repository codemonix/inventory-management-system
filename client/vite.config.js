import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


export default defineConfig(({ mode }) => {

  return {
    base: './',
    plugins: [
      react(),
      tailwindcss()],
    test: {
      server: {
        deps: {
          inline: ["@mui/x-data-grid"],
        },
      },
      // css: false,
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.js',
    },
  }
})
