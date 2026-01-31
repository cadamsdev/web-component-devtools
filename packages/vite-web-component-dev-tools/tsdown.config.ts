import { defineConfig } from 'tsdown';

export default defineConfig([
  // Plugin build (ESM format for Vite)
  {
    entry: ['./src/index.ts'],
    format: 'esm',
    dts: {
      entry: './src/index.ts',
    },
    clean: true,
    outDir: './dist',
  },
  // Client script build (IIFE format for inline injection)
  {
    entry: ['./src/client.ts'],
    format: 'iife',
    outDir: './dist',
    dts: false,
    outputOptions: {
      name: 'WebComponentDevTools',
      entryFileNames: 'client.js',
    },
  },
]);
