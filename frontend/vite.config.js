import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
      '@components': new URL('./src/components', import.meta.url).pathname,
      '@pages': new URL('./src/pages', import.meta.url).pathname,
      '@features': new URL('./src/features', import.meta.url).pathname,
      '@hooks': new URL('./src/hooks', import.meta.url).pathname,
      '@api': new URL('./src/api', import.meta.url).pathname,
      '@utils': new URL('./src/utils', import.meta.url).pathname,
      '@assets': new URL('./src/assets', import.meta.url).pathname,
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
