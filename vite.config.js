import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  // Vercel (web): absolute paths so /auth/callback can load /assets/*.js
  // Android Capacitor: relative paths so file:// protocol resolves correctly
  base: process.env.VERCEL ? '/' : './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
  },
})
