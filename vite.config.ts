import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/time-locker/',
  build: {
    outDir: 'docs',
    emptyOutDir: false,
  },
  plugins: [react()],
})
