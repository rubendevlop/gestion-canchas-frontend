import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('@mercadopago')) return 'mercadopago'
          if (id.includes('firebase')) return 'firebase'
          if (id.includes('lucide-react')) return 'icons'
          if (id.includes('react-router-dom')) return 'router'
          if (id.includes('react') || id.includes('scheduler')) return 'react-vendor'
        },
      },
    },
  },
})
