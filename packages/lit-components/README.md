# lit-components

A reusable Lit component library with React wrappers.

## Components

- **MyButton** - Customizable button with gradient styles
- **MyCounter** - Interactive counter with min/max constraints
- **MyCard** - Card component with slots for flexible content
- **MyBadge** - Badge component with multiple variants

## Installation

```bash
npm install lit-components
```

## Usage

### Vanilla JavaScript / HTML

```typescript
import 'lit-components';

// Components are automatically registered
// Use them directly in HTML
```

```html
<my-button label="Click Me"></my-button>
<my-counter value="5" min="0" max="10"></my-counter>
<my-badge label="New" variant="success"></my-badge>
<my-card title="Card Title" icon="🎉">
  Card content goes here
</my-card>
```

### React

```typescript
import { MyButton, MyCounter, MyBadge, MyCard } from 'lit-components/react';

function App() {
  return (
    <>
      <MyButton label="Click Me" onButtonClick={(e) => console.log(e.detail)} />
      <MyCounter value={5} min={0} max={10} onCounterChange={(e) => console.log(e.detail)} />
      <MyBadge label="New" variant="success" />
      <MyCard title="Card Title" icon="🎉">
        <div>Card content goes here</div>
      </MyCard>
    </>
  );
}
```

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

- ✅ TypeScript support
- ✅ Lit 3.x components
- ✅ React wrappers via @lit/react
- ✅ CSS custom properties for theming
- ✅ Custom events
- ✅ Shadow DOM encapsulation
