import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import packageJson from './package.json'




export default defineConfig(() => {

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
    define: {
      __APP_VERSION__: JSON.stringify(packageJson.version),
    }
  }
})
