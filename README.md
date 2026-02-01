# Vite Web Component Dev Tools

A Vite plugin that provides developer tools for inspecting web components on your page. Shows a fixed button that opens a panel displaying information about all web components in use.

## Monorepo Structure

This is a monorepo containing:

- `packages/vite-web-component-dev-tools` - The Vite plugin
- `apps/react-lit-example` - Example React app using Lit web components

## Features

- Fixed button overlay for easy access
- Scans and displays all web components on the page
- Shows component counts and instances
- Lists attributes used by each component
- Real-time updates when DOM changes
- Configurable button position
- Only active in development mode by default
- **Render count tracking** - Track how many times each component re-renders (toggle on/off)

## Quick Start

```bash
# Install dependencies for all workspaces
npm install

# Build the plugin
npm run build:plugin

# Run the example app
npm run dev
```

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

### Render Count Tracking

The dev tools include a powerful render tracking feature that helps you monitor component performance:

1. **Enable tracking**: Click the **#** button (render tracking toggle) in the toolbar to start tracking re-renders
2. **View counts in panel**: When enabled, each component displays a badge showing how many times it has re-rendered
3. **View counts on page**: Click the **📍** button (overlay toggle) to show render count badges directly on the components in your page
4. **Performance insights**: High render counts may indicate performance issues or unnecessary re-renders
5. **Toggle anytime**: Turn tracking and overlays on/off without losing your current inspection state

The render tracker monitors:
- Attribute changes
- Property changes  
- Child list modifications
- Content updates

**Visual Features**:
- **Panel badges**: Pink/purple gradient badges in the component list
- **On-page overlays**: Floating badges positioned at the top-right of each component
- **Flash animation**: Badges pulse and flash when a new render is detected
- **Real-time updates**: Overlays update automatically as components re-render

**Note**: Render tracking has minimal performance impact but should be toggled off when not needed.

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
npm run build:plugin

# Run the example app
npm run dev
```

## Project Structure

```
vite-web-component-dev-tools/
├── packages/
│   └── vite-web-component-dev-tools/  # The Vite plugin package
│       ├── src/
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
├── apps/
│   └── react-lit-example/             # Example React + Lit app
│       ├── src/
│       │   ├── components/            # Lit web components
│       │   ├── App.tsx
│       │   └── main.tsx
│       ├── package.json
│       └── vite.config.ts
├── package.json                        # Root workspace config
└── README.md
```

## License

MIT
