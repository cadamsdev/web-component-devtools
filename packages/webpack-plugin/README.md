# Webpack Web Component Dev Tools Plugin

A Webpack plugin that provides developer tools for inspecting and debugging web components in your application.

## 📦 Installation

```bash
npm install @cadamsdev/webpack-plugin-wc-devtools --save-dev
```

## 🚀 Usage

Add the plugin to your Webpack configuration:

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

### ⚙️ Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | boolean | `true` | Enable or disable the dev tools. |
| `position` | string | `'bottom-right'` | Position of the dev tools button. Options: `'top-left'`, `'top-right'`, `'bottom-left'`, `'bottom-right'`. |
| `queryParam` | string | `undefined` | Query parameter name to check for enabling dev tools. If specified, the dev tools button will only show when this query param is present in the URL (e.g., `?debug`). |
| `includeInProduction` | boolean | `false` | Include the dev tools in production builds. By default, dev tools are only included in development mode. |

### 💡 Example with Options

```javascript
new WebpackWebComponentDevTools({
  enabled: true,
  position: 'bottom-right',
  queryParam: 'wc-devtools',
  includeInProduction: false
})
```

### 🏭 Production Usage

By default, the dev tools are only included in development builds. If you want to include them in production builds (e.g., for staging environments or internal testing), set `includeInProduction: true`:

```javascript
new WebpackWebComponentDevTools({
  includeInProduction: true,
  queryParam: 'wc-devtools' // Recommended: use with queryParam to hide by default
})
```

**Note:** When using in production, it's recommended to combine `includeInProduction` with `queryParam` to ensure the dev tools are only visible when explicitly requested via a URL parameter.

## ✅ Requirements

- Webpack 5.x
- HtmlWebpackPlugin (required for HTML injection)

## 🔧 How It Works

The plugin automatically injects the dev tools client script into your HTML during the build process when in development mode. The dev tools will appear as a floating button in your browser that you can click to open the inspection panel.

## 📄 License

MIT
