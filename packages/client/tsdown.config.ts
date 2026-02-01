import { defineConfig } from 'tsdown';

export default defineConfig([
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
  // ESM export for programmatic usage
  {
    entry: ['./src/index.ts'],
    format: 'esm',
    outDir: './dist',
    dts: true,
  },
]);
