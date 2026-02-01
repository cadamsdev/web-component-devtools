# Webpack Web Component Dev Tools Plugin

A Webpack plugin that provides developer tools for inspecting and debugging web components in your application.

## Installation

```bash
npm install webpack-plugin --save-dev
```

## Usage

Add the plugin to your Webpack configuration:

```javascript
// webpack.config.js
import { WebpackWebComponentDevTools } from 'webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';

export default {
  mode: 'development',
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),
    new WebpackWebComponentDevTools({
      position: 'bottom-right'
    })
  ]
};
```

### Options

- **`enabled`** (boolean, default: `true`): Enable or disable the dev tools. The plugin only works in development mode.
- **`position`** (string, default: `'bottom-right'`): Position of the dev tools button. Options: `'top-left'`, `'top-right'`, `'bottom-left'`, `'bottom-right'`.

### Example with Options

```javascript
new WebpackWebComponentDevTools({
  enabled: true,
  position: 'top-right'
})
```

## Features

- 🔍 Inspect web component properties and attributes
- 🎨 View and edit CSS custom properties
- 📊 Monitor component lifecycle events
- ♿ Check accessibility compliance
- 🔄 Track component renders and performance
- 🌳 Visualize component hierarchy

## Requirements

- Webpack 5.x
- HtmlWebpackPlugin (required for HTML injection)

## How It Works

The plugin automatically injects the dev tools client script into your HTML during the build process when in development mode. The dev tools will appear as a floating button in your browser that you can click to open the inspection panel.

## License

MIT
