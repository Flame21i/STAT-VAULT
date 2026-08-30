import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss(), react()],   // ← nodePolyfills REMOVED
  build: {
    rollupOptions: {
      external: (id) => id.startsWith('@tauri-apps/')
    },
    rolldownOptions: {
      external: (id) => id.startsWith('@tauri-apps/')
    },
    chunkSizeWarningLimit: 1000
  }
})
