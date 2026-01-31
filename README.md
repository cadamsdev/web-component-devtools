# Vite Web Component Dev Tools

A Vite plugin that provides developer tools for inspecting web components on your page. Shows a fixed button that opens a panel displaying information about all web components in use.

## Features

- Fixed button overlay for easy access
- Scans and displays all web components on the page
- Shows component counts and instances
- Lists attributes used by each component
- Real-time updates when DOM changes
- Configurable button position
- Only active in development mode by default

## Installation

```bash
npm install vite-web-component-dev-tools --save-dev
```

## Usage

Add the plugin to your `vite.config.js` or `vite.config.ts`:

```javascript
import { defineConfig } from 'vite';
import { webComponentDevTools } from 'vite-web-component-dev-tools';

export default defineConfig({
  plugins: [
    webComponentDevTools()
  ]
});
```

### With Options

```javascript
import { defineConfig } from 'vite';
import { webComponentDevTools } from 'vite-web-component-dev-tools';

export default defineConfig({
  plugins: [
    webComponentDevTools({
      enabled: true, // Enable/disable the dev tools
      position: 'bottom-right' // Button position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
    })
  ]
});
```

## How It Works

Once installed and configured, the plugin will:

1. Inject a floating button (⚡) on your page in development mode
2. Click the button to open the dev tools panel
3. The panel displays:
   - Total count of unique web components
   - Total instances across the page
   - Each component with its tag name
   - Number of instances for each component
   - Attributes used by each component
4. Automatically updates when the DOM changes

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `true` | Enable or disable the dev tools |
| `position` | `string` | `'bottom-right'` | Position of the button: `'top-left'`, `'top-right'`, `'bottom-left'`, or `'bottom-right'` |

## Example

When you have web components like:

```html
<my-button label="Click me" disabled></my-button>
<my-button label="Submit"></my-button>
<custom-card title="Hello World"></custom-card>
```

The dev tools will show:
- 2 unique components
- 3 total instances
- `<my-button>` with 2 instances and attributes: `label`, `disabled`
- `<custom-card>` with 1 instance and attribute: `title`

## Development

```bash
# Install dependencies
npm install

# Build the plugin
npm run build

# Watch mode for development
npm run dev
```

## License

MIT
