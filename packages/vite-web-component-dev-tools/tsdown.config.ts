import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['./src/index.ts'],
  format: 'iife',
  dts: {
    entry: './src/index.ts',
  },
  clean: true,
  outputOptions: {
    name: 'ViteWebComponentDevTools',
    exports: 'named',
    entryFileNames: '[name].js',
  },
});
