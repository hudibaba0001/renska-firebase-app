import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'tailwindcss/version.js': path.resolve(__dirname, './src/shims/tailwind-version-stub.js'),
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
