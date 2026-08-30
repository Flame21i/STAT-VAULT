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
    // Standard Rollup options (Vite v5/v6)
    rollupOptions: {
      external: [
        /^@tauri-apps\/.*/
      ]
    },
    // Rolldown options (Vite v8)
    rolldownOptions: {
      external: [
        /^@tauri-apps\/.*/
      ]
    }
  },
})
