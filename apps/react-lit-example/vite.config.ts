import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { webComponentDevTools } from '../../src/index'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    webComponentDevTools({
      position: 'bottom-right'
    })
  ],
})
