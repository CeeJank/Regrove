import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    host: true, // needed inside Docker so Vite binds to 0.0.0.0 not just 127.0.0.1
    proxy: {
      // Inside Docker the backend is reachable via its service name, not localhost.
      // Outside Docker (running vite locally) this still works if you run the
      // backend on port 5000 — just change target to http://localhost:5000.
      '/api': {
        target: 'http://backend:5000',
        changeOrigin: true,
      },
    },
  },
})
