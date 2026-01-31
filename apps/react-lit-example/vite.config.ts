import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { webComponentDevTools } from 'vite-web-component-dev-tools'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    webComponentDevTools({
      position: 'bottom-right'
    })
  ],
})
