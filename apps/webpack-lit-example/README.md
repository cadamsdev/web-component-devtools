# Webpack + React + Lit Web Components Example

This example application demonstrates how to use the `webpack-plugin` package to integrate web component developer tools into a Webpack + React application.

## 🚀 Features

- **Webpack 5**: Modern build tool configuration
- **React 18**: Component-based UI framework
- **Lit Web Components**: Four custom elements (button, card, counter, badge)
- **TypeScript**: Full type safety
- **Dev Tools Integration**: Webpack plugin for inspecting web components
- **Hot Module Replacement**: Fast development experience

## 📦 Web Components

### `<my-button>`
Interactive button component with various states and variants.

**Props:**
- `label` (string): Button text
- `disabled` (boolean): Disable the button
- `variant` (string): Button style variant

**Events:**
- `button-click`: Emitted when button is clicked

### `<my-card>`
Card container with header, body, and footer slots.

**Props:**
- `title` (string): Card title
- `description` (string): Card description
- `icon` (string): Icon emoji
- `elevated` (boolean): Add elevation shadow

**Slots:**
- Default: Card body content
- `footer`: Card footer content

### `<my-counter>`
Stateful counter with increment/decrement controls.

**Props:**
- `value` (number): Current count value
- `min` (number): Minimum value
- `max` (number): Maximum value
- `label` (string): Counter label

**Events:**
- `counter-change`: Emitted when value changes

### `<my-badge>`
Small label for status and categories.

**Props:**
- `label` (string): Badge text
- `variant` (string): Badge color variant (primary, success, info, warning, danger)

## 🛠️ Getting Started

### Install Dependencies

```bash
bun install
```

### Development

Start the development server with hot reload:

```bash
bun run dev
```

The app will open at http://localhost:3001

### Build

Build the production bundle:

```bash
bun run build
```

### Preview

Preview the production build:

```bash
bun run preview
```

## 🔍 Using the Dev Tools

1. Start the development server
2. Open the app in your browser
3. Look for the purple lightning button (⚡) in the bottom-right corner
4. Click it to open the Web Component Inspector
5. Explore all web components on the page:
   - View component hierarchy
   - Inspect properties and attributes
   - Monitor events
   - Check accessibility
   - View CSS custom properties

## 📁 Project Structure

```
webpack-lit-example/
├── src/
│   ├── components/
│   │   ├── index.ts           # Component exports
│   │   ├── my-button.ts       # Button component
│   │   ├── my-card.ts         # Card component
│   │   ├── my-counter.ts      # Counter component
│   │   └── my-badge.ts        # Badge component
│   ├── main.tsx               # React entry point
│   ├── App.tsx                # Main React component
│   ├── App.css                # Component styles
│   └── styles.css             # Global styles
├── index.html                 # HTML template
├── webpack.config.js          # Webpack configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Package metadata
```

## ⚙️ Webpack Configuration

The webpack configuration includes:

```javascript
import { WebpackWebComponentDevTools } from 'webpack-plugin';

export default {
  // ... other config
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
    new WebpackWebComponentDevTools({
      enabled: true,
      position: 'bottom-right',
    }),
  ],
};
```

### Plugin Options

- **`enabled`** (boolean): Enable/disable dev tools (default: true in dev mode)
- **`position`** (string): Button position - `'top-left'`, `'top-right'`, `'bottom-left'`, `'bottom-right'`

## 🎨 CSS Custom Properties

All components use CSS custom properties for theming:

```css
:root {
  --primary-gradient-start: #667eea;
  --primary-gradient-end: #764ba2;
  --card-bg: white;
  --card-border-radius: 12px;
}
```

You can override these in your own styles to customize the appearance.

## ⚛️ React Integration

This example shows how to use Lit web components within React:

```tsx
import { useRef, useEffect } from 'react';
import './components'; // Import web components

function App() {
  const buttonRef = useRef<any>(null);

  useEffect(() => {
    const handleClick = (e: CustomEvent) => {
      console.log('Clicked:', e.detail);
    };

    buttonRef.current?.addEventListener('button-click', handleClick);
    return () => {
      buttonRef.current?.removeEventListener('button-click', handleClick);
    };
  }, []);

  return <my-button ref={buttonRef} label="Click Me" />;
}
```

**Key Points:**
- Import components to register them
- Use refs to access web component instances
- Add event listeners in `useEffect`
- Clean up event listeners on unmount
- TypeScript declarations for JSX support

## 📊 Build Statistics

### Development
- HTML: ~202 KB (includes dev tools)
- JS: ~1.36 MB (unminified with React)
- Dev Tools: ✅ Injected

### Production
- HTML: 295 bytes (no dev tools)  
- JS: ~174 KB (minified with React)
- Dev Tools: ❌ Not included

## 📚 Learn More

- [Webpack Documentation](https://webpack.js.org/)
- [React Documentation](https://react.dev/)
- [Lit Documentation](https://lit.dev/)
- [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components)

## 🤝 Related Examples

- [react-lit-example](../react-lit-example): React + Vite + Lit example

Both examples use the same React components and Lit web components, but with different build tools (Webpack vs Vite).

## 📝 License

MIT
