# React + Lit Web Components Example

This is an example application demonstrating how to use Lit web components in a React application with the Vite Web Component Dev Tools plugin.

## Using the Dev Tools

Once the app is running:

1. Click the button in the bottom right to open the dev tools panel
2. View all web components on the page
3. See instance counts and attributes for each component
4. The panel updates automatically as components are added/removed

## Features

- React 18 with TypeScript
- Lit web components
- @lit/react for React wrappers
- Vite for fast development
- Web Component Dev Tools plugin integration

## React Integration with @lit/react

This example uses `@lit/react` to create proper React wrappers for Lit web components:

```tsx
import { createComponent } from '@lit/react';
import { MyButton as MyButtonWC } from './my-button';

export const MyButton = createComponent({
  tagName: 'my-button',
  elementClass: MyButtonWC,
  react: React,
  events: {
    onButtonClick: 'button-click',
  },
});

// Use in React components
<MyButton label="Click Me" onButtonClick={handleClick} />
```

**Benefits:**
- ✅ Proper TypeScript support  
- ✅ React event naming conventions
- ✅ No manual event listeners
- ✅ Better developer experience

See [LIT_REACT_INTEGRATION.md](../../LIT_REACT_INTEGRATION.md) for complete documentation.

## Web Components

This example includes four custom Lit web components:

### `<my-button>`
Interactive button component with hover effects and disabled state.

**Attributes:**
- `label` - Button text
- `disabled` - Disable the button
- `variant` - Button style variant

**Events:**
- `button-click` - Fired when button is clicked

### `<my-card>`
Card container with header, icon, and footer slots.

**Attributes:**
- `title` - Card title
- `description` - Card description
- `icon` - Icon emoji
- `elevated` - Elevated shadow effect

**Slots:**
- default - Main content
- `footer` - Footer content

### `<my-counter>`
Stateful counter with increment/decrement buttons.

**Attributes:**
- `value` - Initial value
- `min` - Minimum value
- `max` - Maximum value
- `label` - Counter label

**Events:**
- `counter-change` - Fired when count changes

### `<my-badge>`
Small label component for status and categories.

**Attributes:**
- `label` - Badge text
- `variant` - Color variant (primary, success, warning, danger, info)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

1. Open your browser and click the purple button in the bottom-right corner to open the Web Component Dev Tools!

## Project Structure

```
src/
├── components/
│   ├── my-button.ts      # Button web component
│   ├── my-card.ts        # Card web component
│   ├── my-counter.ts     # Counter web component
│   ├── my-badge.ts       # Badge web component
│   └── index.ts          # Component exports
├── App.tsx               # React app
├── App.css              # Styles
└── main.tsx             # Entry point
```

## How It Works

The web components are defined using Lit and registered as custom elements. React uses these components by:

1. Importing the component definitions to register them
2. Using them in JSX with proper TypeScript declarations
3. Attaching event listeners via refs for custom events

The Vite plugin automatically injects the dev tools UI during development, allowing you to inspect all web components without any additional setup.
