# Web Component Dev Tools Client

Client-side script for web component developer tools. This package provides the UI and functionality for debugging web components on a page.

## Usage

This package is designed to be used by build tool plugins (like Vite, Webpack, etc.) to inject developer tools into web applications.

## Configuration

The dev tools accept a configuration object via the global `window.__WC_DEVTOOLS_CONFIG__`:

```typescript
interface DevToolsConfig {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}
```

## Outputs

This package builds two outputs:

- `dist/client.js` - IIFE bundle for inline injection into HTML
- `dist/index.mjs` - ESM export for programmatic usage

## License

MIT
