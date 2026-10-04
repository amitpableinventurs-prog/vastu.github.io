import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT, 10) || 5173,
    allowedHosts: ['eight-symbols-lose.loca.lt'],
  },
  preview: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT, 10) || 5173,
    allowedHosts: ['vastucityrameshwaram.com'],
  },
  base: process.env.GITHUB_ACTIONS === 'true' ? '/vastu.github.io/' : '/',
  plugins: [react()],
})
