import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import packageJson from './package.json'

// Libraries every page needs go in their own chunks: they change far less often than the app code,
// so browsers keep them cached across deploys. Page-only libraries (the DataGrid, image compression,
// icons) are left out so they still load with the lazy page that uses them.
const VENDOR_CHUNKS: Record<string, RegExp> = {
  react: /node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)\//,
  mui: /node_modules\/(@mui\/(material|system|utils|styled-engine|private-theming|core-downloads-tracker)|@emotion|@popperjs|react-transition-group|stylis)\//,
  redux: /node_modules\/(@reduxjs|redux|react-redux|immer|reselect|redux-thunk)\//,
}

export default defineConfig(() => {

  return {
    // Absolute asset URLs: with './' a reload on a nested route such as /manage/users
    // requested /manage/assets/*.js and got index.html back, leaving a blank page.
    base: '/',
    plugins: [react()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            return Object.keys(VENDOR_CHUNKS).find((name) => VENDOR_CHUNKS[name].test(id));
          },
        },
      },
    },
    test: {
      server: {
        deps: {
          inline: ["@mui/x-data-grid"],
        },
      },
      // css: false,
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
    },
    define: {
      __APP_VERSION__: JSON.stringify(packageJson.version),
    }
  }
})
