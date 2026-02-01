# @web-component-dev-tools/react-lit-components

React wrapper components for `@web-component-dev-tools/lit-components`.

## Installation

```bash
npm install @web-component-dev-tools/react-lit-components
```

This package automatically installs `@web-component-dev-tools/lit-components` as a dependency.

## Usage

```typescript
import { MyButton, MyCounter, MyBadge, MyCard } from '@web-component-dev-tools/react-lit-components';

function App() {
  const handleButtonClick = (e: CustomEvent) => {
    console.log('Button clicked:', e.detail);
  };

  const handleCounterChange = (e: CustomEvent) => {
    console.log('Counter changed:', e.detail);
  };

  return (
    <>
      <MyButton 
        label="Click Me" 
        onButtonClick={handleButtonClick} 
      />
      
      <MyCounter 
        value={5} 
        min={0} 
        max={10} 
        label="Items"
        onCounterChange={handleCounterChange} 
      />
      
      <MyBadge label="New" variant="success" />
      
      <MyCard title="Card Title" icon="🎉">
        <div>Card content goes here</div>
        <span slot="footer">Footer content</span>
      </MyCard>
    </>
  );
}
```

## Components

All components from `@web-component-dev-tools/lit-components` are wrapped for React:

- **MyButton** - Interactive button with events
  - Props: `label`, `disabled`, `variant`
  - Events: `onButtonClick`

- **MyCounter** - Stateful counter
  - Props: `value`, `min`, `max`, `label`
  - Events: `onCounterChange`

- **MyCard** - Card with slots
  - Props: `title`, `description`, `icon`, `elevated`
  - Slots: default, `footer`

- **MyBadge** - Status badge
  - Props: `label`, `variant` (`'primary' | 'success' | 'warning' | 'danger' | 'info'`)

## Development

```bash
# Build the library
npm run build

# Watch mode for development
npm run dev

# Clean build artifacts
npm run clean
```

## Features

- ✅ Full TypeScript support
- ✅ React 18+ compatible
- ✅ Proper event handling with `@lit/react`
- ✅ All component props and events typed
