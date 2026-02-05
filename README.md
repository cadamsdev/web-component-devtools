# Web Component Dev Tools

A tool that allows you to inspect and debug web components in your app.

## Packages

| Package | Description | Version |
|---------|-------------|---------|
| [@cadamsdev/vite-plugin-wc-devtools](./packages/vite-plugin) | Vite plugin | ![npm](https://img.shields.io/npm/v/@cadamsdev/vite-plugin-wc-devtools) |
| [@cadamsdev/webpack-plugin-wc-devtools](./packages/webpack-plugin) | Webpack plugin | ![npm](https://img.shields.io/npm/v/@cadamsdev/webpack-plugin-wc-devtools) |
| [@cadamsdev/wc-devtools-client](./packages/client) | Client-side script | ![npm](https://img.shields.io/npm/v/@cadamsdev/wc-devtools-client) |

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

[MIT](./LICENSE) © Chad Adams and contributors

## Acknowledgments

Built with:
- [Lit](https://lit.dev) - For building the dev tools UI components
- [TypeScript](https://www.typescriptlang.org/) - For type-safe development
- [Bun](https://bun.sh) - For fast package management and builds
- [tsdown](https://github.com/rolldown/tsdown) - For bundling packages

## Support

If you find this project helpful, please consider:
- Giving it a ⭐️ on GitHub
- Reporting bugs or requesting features via [GitHub Issues](https://github.com/cadamsdev/web-component-dev-tools/issues)
- Contributing code or documentation improvements

---

Made with ❤️ for the web components community

