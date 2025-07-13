import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    'process.env.TAILWIND_VERSION': JSON.stringify('3.4.15'),
  },
  build: {
    rollupOptions: {
      external: ['tailwindcss/version.js'],
    },
  },
})
