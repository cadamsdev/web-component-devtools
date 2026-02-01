import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { webComponentDevTools } from '@cadamsdev/vite-plugin-wc-devtools';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    webComponentDevTools({
      position: 'bottom-right',
    }),
  ],
});
