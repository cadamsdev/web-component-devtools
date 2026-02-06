# Web Component Dev Tools

A tool that allows you to inspect and debug web components in your app.

![Preview](./media/preview.png)

## Features
- View attributes, properties, public methods, slots, css variables, nested components.
- Show overlay of components on the page.
- Monitor events and viewing custom event detail objects.
- Check for accessibility issues.
- Check for component re-renders.

## Packages

| Package | Description | Version |
|---------|-------------|---------|
| [@cadamsdev/vite-plugin-wc-devtools](./packages/vite-plugin) | Vite plugin | ![npm](https://img.shields.io/npm/v/@cadamsdev/vite-plugin-wc-devtools) |
| [@cadamsdev/webpack-plugin-wc-devtools](./packages/webpack-plugin) | Webpack plugin | ![npm](https://img.shields.io/npm/v/@cadamsdev/webpack-plugin-wc-devtools) |
| [@cadamsdev/wc-devtools-client](./packages/client) | Client-side script | ![npm](https://img.shields.io/npm/v/@cadamsdev/wc-devtools-client) |

## Screenshots

<details>
<summary>Click to view screenshots</summary>

### Panel Overview
![Panel](./media/panel.png)

### Panel Open
![Panel Open](./media/panel-open.png)

### Component Details
![Component Details](./media/component-details.png)

### Component Details with Nested Components
![Component Details - Nested Components](./media/component-details-nested-components.png)

### Component Overlays
![Component Overlays](./media/component-overlays.png)

### Highlight Component
![Highlight Component](./media/highlight-component.png)

### Log Element to Console
![Log Element to Console](./media/log-element-to-console.png)

### Monitor Events
![Monitor Events](./media/monitor-events.png)

### Scroll to Element
![Scroll to Element](./media/scroll-to-element.png)

### Shadow DOM Indicator, Overlay and Badge
![Shadow DOM Indicator, Overlay and Badge](./media/shadow-dom-indicator-overlay-and-badge.png)

### View Accessibility Issues
![View Accessibility Issues](./media/view-accessibility-issues.png)

### View Re-renders
![View Re-renders](./media/view-rerenders.png)

</details>

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
