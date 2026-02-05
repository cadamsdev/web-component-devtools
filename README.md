# Web Component Dev Tools

A tool that allows you to inspect and debug web components in your app.

## Packages

| Package | Description | Version |
|---------|-------------|---------|
| [@cadamsdev/vite-plugin-wc-devtools](./packages/vite-plugin) | Vite plugin | ![npm](https://img.shields.io/npm/v/@cadamsdev/vite-plugin-wc-devtools) |
| [@cadamsdev/webpack-plugin-wc-devtools](./packages/webpack-plugin) | Webpack plugin | ![npm](https://img.shields.io/npm/v/@cadamsdev/webpack-plugin-wc-devtools) |
| [@cadamsdev/wc-devtools-client](./packages/client) | Client-side script | ![npm](https://img.shields.io/npm/v/@cadamsdev/wc-devtools-client) |

## ❤️ Sponsors

Support development by becoming a sponsor! Your avatar or company logo will appear below.

[Become a Sponsor](https://github.com/sponsors/cadamsdev)

<!-- Sponsors will appear here -->

## Quick Start

### Vite

```bash
npm install @cadamsdev/vite-plugin-wc-devtools --save-dev
```

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { webComponentDevTools } from '@cadamsdev/vite-plugin-wc-devtools';

export default defineConfig({
  plugins: [webComponentDevTools()],
});
```

### Webpack

```bash
npm install @cadamsdev/webpack-plugin-wc-devtools --save-dev
```

```javascript
// webpack.config.js
import { WebpackWebComponentDevTools } from '@cadamsdev/webpack-plugin-wc-devtools';
import HtmlWebpackPlugin from 'html-webpack-plugin';

export default {
  mode: 'development',
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),
    new WebpackWebComponentDevTools()
  ]
};
```

## License

[MIT](./LICENSE)
