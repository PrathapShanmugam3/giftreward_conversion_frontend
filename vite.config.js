import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  server: {
    port: 5173,
    proxy: {
      // Keeps the frontend dev server and backend API same-origin in dev so
      // cookies (JWT) work without extra CORS dance. Mirrors how everything
      // will sit behind one reverse proxy in production.
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      // Public tracking endpoints, server-rendered by the backend and hit
      // directly by advertisers/publishers (not React pages) — see
      // giftreward_backend/src/app.js for what each one does.
      '/go': { target: 'http://localhost:5000', changeOrigin: true },
      '/postback': { target: 'http://localhost:5000', changeOrigin: true },
      '/report': { target: 'http://localhost:5000', changeOrigin: true },
      '/tracking': { target: 'http://localhost:5000', changeOrigin: true },
    },
  },
})
