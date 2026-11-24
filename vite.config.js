import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In development, forward /api requests to the Flask server (python api/main.py).
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
})
