# client

Client-side script for web component developer tools. This package provides the UI and functionality for debugging web components on a page.

## Usage

This package is designed to be used by build tool plugins (like Vite, Webpack, etc.) to inject developer tools into web applications.

### As a Build Tool Plugin Dependency

Build tool plugins can reference the pre-built client script:

```typescript
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

const require = createRequire(import.meta.url);
const clientScriptPath = require.resolve('client/client');
const clientScript = readFileSync(clientScriptPath, 'utf-8');
```

### Programmatic Usage

You can also import and initialize the dev tools programmatically:

```typescript
import { initDevTools } from 'client';

initDevTools({
  position: 'bottom-right'
});
```

## Configuration

The dev tools accept a configuration object via the global `window.__WC_DEVTOOLS_CONFIG__`:

```typescript
interface DevToolsConfig {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}
```

## Features

- Lists all web components on the page
- Shows instance counts for each component
- Displays component attributes
- Real-time updates when components are added/removed
- Minimal UI that stays out of your way

## Outputs

This package builds two outputs:

- `dist/client.js` - IIFE bundle for inline injection into HTML
- `dist/index.mjs` - ESM export for programmatic usage

## License

MIT
