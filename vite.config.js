import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    nodePolyfills()
  ],
  build: {
    rollupOptions: {
      external: (id) => id.startsWith('@tauri-apps/')
    },
    rolldownOptions: {
      external: (id) => id.startsWith('@tauri-apps/')
    }
  }
})
