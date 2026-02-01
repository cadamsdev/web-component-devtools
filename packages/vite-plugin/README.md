# Vite Web Component Dev Tools Plugin

A Vite plugin that provides developer tools for inspecting and debugging web components in your application.

## Installation

```bash
npm install vite-plugin --save-dev
```

## Usage

Add the plugin to your Vite configuration:

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import { webComponentDevTools } from 'vite-plugin';

export default defineConfig({
  plugins: [
    webComponentDevTools({
      position: 'bottom-right'
    })
  ]
});
```

### Options

- **`enabled`** (boolean, default: `true`): Enable or disable the dev tools.
- **`position`** (string, default: `'bottom-right'`): Position of the dev tools button. Options: `'top-left'`, `'top-right'`, `'bottom-left'`, `'bottom-right'`.
- **`queryParam`** (string, optional): Query parameter name to check for enabling dev tools. If specified, the dev tools button will only show when this query param is present in the URL (e.g., `?debug`).
- **`includeInProduction`** (boolean, default: `false`): Include the dev tools in production builds. By default, dev tools are only included in development mode.

### Example with Options

```javascript
webComponentDevTools({
  enabled: true,
  position: 'top-right',
  queryParam: 'debug',
  includeInProduction: false
})
```

### Production Usage

By default, the dev tools are only included in development builds. If you want to include them in production builds (e.g., for staging environments or internal testing), set `includeInProduction: true`:

```javascript
webComponentDevTools({
  includeInProduction: true,
  queryParam: 'devtools' // Recommended: use with queryParam to hide by default
})
```

**Note:** When using in production, it's recommended to combine `includeInProduction` with `queryParam` to ensure the dev tools are only visible when explicitly requested via a URL parameter.

## Features

- 🔍 Inspect web component properties and attributes
- 🎨 View and edit CSS custom properties
- 📊 Monitor component lifecycle events
- ♿ Check accessibility compliance
- 🔄 Track component renders and performance
- 🌳 Visualize component hierarchy

## Requirements

- Vite 4.x or higher

## How It Works

The plugin automatically injects the dev tools client script into your HTML during the build process when in development mode. The dev tools will appear as a floating button in your browser that you can click to open the inspection panel.

## License

MIT
