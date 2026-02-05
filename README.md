# Web Component Dev Tools

> Developer tools for inspecting and debugging web components in your application

A lightweight, build-tool agnostic solution that adds a floating dev tools panel to your application, allowing you to inspect all web components (custom elements) on the page in real-time.

## Features

- **Real-time Component Discovery** - Automatically detects and lists all custom elements on the page
- **Component Inspector** - View component properties, attributes, and shadow DOM structure
- **Live Updates** - Watch components dynamically as they're added or removed from the DOM
- **Framework Agnostic** - Works with any web component library (Lit, Stencil, native custom elements, etc.)
- **Multiple Build Tool Support** - Available as plugins for Vite and Webpack
- **Zero Runtime Dependencies** - Lightweight client script with no external dependencies
- **Configurable Position** - Place the dev tools panel anywhere on the screen
- **Development Only** - Automatically disabled in production builds

## Packages

This monorepo contains three packages:

| Package | Description | Version |
|---------|-------------|---------|
| [@cadamsdev/vite-plugin-wc-devtools](./packages/vite-plugin) | Vite plugin | ![npm](https://img.shields.io/npm/v/@cadamsdev/vite-plugin-wc-devtools) |
| [@cadamsdev/webpack-plugin-wc-devtools](./packages/webpack-plugin) | Webpack plugin | ![npm](https://img.shields.io/npm/v/@cadamsdev/webpack-plugin-wc-devtools) |
| [@cadamsdev/wc-devtools-client](./packages/client) | Client-side script | ![npm](https://img.shields.io/npm/v/@cadamsdev/wc-devtools-client) |

## Quick Start

### Vite

```bash
bun add -D @cadamsdev/vite-plugin-wc-devtools
# or
npm install -D @cadamsdev/vite-plugin-wc-devtools
```

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { webComponentDevTools } from '@cadamsdev/vite-plugin-wc-devtools';

export default defineConfig({
  plugins: [
    webComponentDevTools({
      enabled: true,
      position: 'bottom-right',
    }),
  ],
});
```

### Webpack

```bash
bun add -D @cadamsdev/webpack-plugin-wc-devtools
# or
npm install -D @cadamsdev/webpack-plugin-wc-devtools
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

### Standalone Client

For other build tools or manual integration:

```bash
bun add -D @cadamsdev/wc-devtools-client
# or
npm install -D @cadamsdev/wc-devtools-client
```

```typescript
import { initDevTools } from '@cadamsdev/wc-devtools-client';

if (import.meta.env.DEV) {
  initDevTools({
    position: 'bottom-right',
  });
}
```

## Configuration

All plugins accept the following configuration options:

```typescript
interface DevToolsConfig {
  /**
   * Enable the dev tools (default: true in dev mode only)
   */
  enabled?: boolean;

  /**
   * Position of the floating button
   * @default 'bottom-right'
   */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}
```

## How It Works

1. The plugin injects a lightweight client script into your HTML during development
2. The client script scans the DOM for custom elements (web components)
3. A floating button appears on the page that opens the dev tools panel
4. The panel displays all detected web components with their tag names and properties
5. The tool uses MutationObserver to watch for new components added dynamically

## Examples

This repository includes example applications demonstrating the dev tools:

- **[Vite Example](./apps/vite-example)** - React + Vite + Lit web components
- **[Webpack Example](./apps/webpack-example)** - React + Webpack + Lit web components

To run the examples locally, see the [Contributing Guide](./docs/CONTRIBUTING.md#running-example-apps).

## Contributing

We welcome contributions! Please see our [Contributing Guide](./docs/CONTRIBUTING.md) for details on:

- Setting up your development environment
- Project structure and architecture
- Development workflow and testing
- Code style guidelines
- Submitting pull requests

For bugs and feature requests, please [open an issue](https://github.com/cadamsdev/web-component-dev-tools/issues).

## Roadmap

- [ ] Add component property editing
- [ ] Add event listener inspection
- [ ] Add performance metrics
- [ ] Support for more build tools (Rollup, esbuild, etc.)
- [ ] Browser extension version
- [ ] Component hierarchy visualization

## License

[MIT](./LICENSE) © Chad Adams and contributors

## Acknowledgments

Built with:
- [Lit](https://lit.dev) - For building the dev tools UI components
- [TypeScript](https://www.typescriptlang.org/) - For type-safe development
- [Bun](https://bun.sh) - For fast package management and builds
- [tsdown](https://github.com/sxzz/tsdown) - For bundling packages

## Support

If you find this project helpful, please consider:
- Giving it a ⭐️ on GitHub
- Reporting bugs or requesting features via [GitHub Issues](https://github.com/cadamsdev/web-component-dev-tools/issues)
- Contributing code or documentation improvements

---

Made with ❤️ for the web components community

