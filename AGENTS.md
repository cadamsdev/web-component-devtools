# Agent Guidelines for vite-web-component-dev-tools

This document provides guidelines for AI coding agents working in this repository.

## Project Overview

This is a **monorepo** for developer tools that help inspect web components. It uses **Bun** as the package manager with workspace support.

**Structure:**
- `packages/client/` - The client-side script (build-tool agnostic)
- `packages/vite-plugin/` - The Vite plugin package
- `apps/vite-example/` - Example React + Lit application

**Architecture:**
The project is split into two packages:
1. **Client Package** (`client`) - Contains the UI and functionality for debugging web components. This package is build-tool agnostic and can be used by any build tool plugin (Vite, Webpack, Rollup, etc.).
2. **Vite Plugin** (`vite-plugin`) - A Vite-specific plugin that injects the client script into the page during development. It depends on the client package.

## Build, Lint, and Test Commands

### Package Manager
This project uses **Bun**. Use `bun install` for dependencies.

### Build Commands
```bash
# Build all workspaces
bun run build

# Build only the client package
bun run build:client

# Build only the Vite plugin
bun run build:plugin

# Build in watch mode
cd packages/client && bun run dev
cd packages/vite-plugin && bun run dev
```

### Development Commands
```bash
# Run the example app in dev mode
bun run dev

# Preview production build
cd apps/vite-example && bun run preview
```

### Linting and Formatting
**No linting or formatting tools are currently configured.** If adding code, follow the existing style patterns described below.

### Testing
**No testing framework is currently configured.** Tests are not available at this time.

## Code Style Guidelines

### File Organization
- One export per file is preferred for components
- Use barrel exports (`index.ts`) to re-export from directories
- Keep client code separate from plugin code for reusability
- Use DOM manipulation instead of template strings for building HTML elements (easier to maintain)

### TypeScript

**Strict Mode:** All packages use TypeScript strict mode. Ensure:
- No implicit `any` types
- Explicit return types for exported functions
- Proper null/undefined handling

**Module System:**
- ESM only (`type: "module"` in all package.json files)
- Use `.js` extensions in imports when required by tooling
- Module resolution: `bundler`

**Target:** ES2020 for all packages

### Imports

**Order and Style:**
```typescript
// 1. External dependencies (libraries)
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { Plugin } from 'vite';

// 2. Internal imports (workspace packages)
import { webComponentDevTools } from 'vite-plugin';

// 3. Relative imports
import './components';
import type { MyType } from './types';
```

**Type-only imports:** Use `import type` for types that are only used in type positions:
```typescript
import type { Plugin } from 'vite';
```

### Naming Conventions

**Files:**
- Component files: `kebab-case.ts` (e.g., `my-button.ts`)
- Config files: `kebab-case` (e.g., `vite.config.ts`)
- No `.component.ts` or `.service.ts` suffixes

**Variables and Functions:**
- camelCase for variables and functions: `updateComponentList()`, `isDev`
- Private class members: prefix with underscore: `_count`, `_increment()`
- Constants: camelCase (not SCREAMING_SNAKE_CASE unless truly constant)

**Types and Interfaces:**
- PascalCase: `WebComponentDevToolsOptions`, `MyCounter`
- Interface names: descriptive without `I` prefix

**CSS Classes:**
- kebab-case: `.wc-devtools-header`, `.counter`

**Web Components:**
- Custom element names: kebab-case with hyphen: `my-button`, `my-counter`

### Formatting

**Indentation:** 2 spaces (no tabs)

**Line Length:** No strict limit, but keep lines readable (aim for ~100 chars)

**Semicolons:** Use semicolons consistently

**Quotes:** Single quotes for strings, template literals for interpolation

**Trailing Commas:** Use in multiline objects/arrays

**Object Literals:**
```typescript
const options = {
  enabled: true,
  position: 'bottom-right',
};
```

### Lit Web Components

**Decorators:** Enable `experimentalDecorators` in tsconfig.json
```typescript
@customElement('my-component')
export class MyComponent extends LitElement {
  @property({ type: String })
  label = '';

  @state()
  private _internalState = 0;
}
```

**Important:** Set `useDefineForClassFields: false` for Lit compatibility

**Styles:**
```typescript
static styles = css`
  :host {
    display: block;
  }
`;
```

**Template Rendering:**
```typescript
render() {
  return html`
    <div class="container">
      ${this.label ? html`<span>${this.label}</span>` : ''}
    </div>
  `;
}
```

**Event Dispatching:**
```typescript
this.dispatchEvent(new CustomEvent('custom-event', {
  detail: { value: this.value },
  bubbles: true,
  composed: true,  // Required to cross shadow DOM boundary
}));
```

**Type Declarations:**
```typescript
declare global {
  interface HTMLElementTagNameMap {
    'my-component': MyComponent;
  }
}
```

### React Integration with Web Components

**Importing Components:**
```typescript
// Import to register custom elements
import './components';

// Declare JSX types
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'my-button': any;  // Use proper typing if available
    }
  }
}
```

**Event Handling:**
```typescript
const buttonRef = useRef<any>(null);

useEffect(() => {
  const handler = (e: CustomEvent) => {
    console.log(e.detail);
  };
  
  buttonRef.current?.addEventListener('custom-event', handler);
  
  return () => {
    buttonRef.current?.removeEventListener('custom-event', handler);
  };
}, []);

// In JSX
<my-button ref={buttonRef} label="Click Me"></my-button>
```

### Build Tool Plugin Development

**General Pattern for Any Build Tool:**

Build tool plugins should load the client script from the `client` package:

```typescript
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

const require = createRequire(import.meta.url);

// Resolve and load the client script
const clientScriptPath = require.resolve('client/client');
const clientScript = readFileSync(clientScriptPath, 'utf-8');

// Inject into HTML with configuration
const script = `
  window.__WC_DEVTOOLS_CONFIG__ = ${JSON.stringify({ position: 'bottom-right' })};
  ${clientScript}
`;
```

**Vite Plugin Structure:**
```typescript
export function pluginName(options: OptionsType = {}): Plugin {
  const { option1 = defaultValue } = options;
  
  return {
    name: 'plugin-name',
    
    configResolved(config) {
      // Access resolved config
      // Load client script here (once)
    },
    
    transformIndexHtml(html) {
      // Transform HTML
      return {
        html,
        tags: [/* ... */],
      };
    },
  };
}
```

**Conditional Injection:**
- Only inject dev tools in development mode
- Check `config.mode === 'development'`
- Load the client script once in `configResolved` hook, not on every HTML transformation

### Error Handling

**Type Guards:** Use proper type checking
```typescript
if (!element) {
  return;
}
```

**Validation:** Validate inputs early in functions
```typescript
if (this._count < this.max) {
  this._count++;
}
```

**No Silent Failures:** Log errors or handle them explicitly

### Comments

**JSDoc for Public APIs:**
```typescript
/**
 * Enable the dev tools (default: true in dev mode only)
 */
enabled?: boolean;
```

**Inline Comments:** Use sparingly, only when code intent is unclear

**TODO Comments:** Acceptable format:
```typescript
// TODO: Add feature X
```

## Common Patterns

### Workspace Dependencies
In package.json (for internal workspace packages):
```json
"dependencies": {
  "client": "workspace:*"
}
```

Example: The Vite plugin depends on the client package:
```json
{
  "name": "vite-plugin",
  "dependencies": {
    "client": "workspace:*"
  }
}
```

### Exporting from Packages

**Client Package Export Pattern:**
```typescript
// src/index.ts - Re-export for programmatic usage
export { initDevTools } from './client';
export interface DevToolsConfig { /* ... */ }
```

**Vite Plugin Export Pattern:**
```typescript
// src/index.ts
export function webComponentDevTools(options) { /* ... */ }
export default webComponentDevTools;
```

**Package.json Exports:**
```json
{
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "types": "./dist/index.d.mts"
    },
    "./client": {
      "import": "./dist/client.js",
      "default": "./dist/client.js"
    }
  }
}
```

### MutationObserver Usage
For DOM watching:
```typescript
const observer = new MutationObserver(() => {
  // Update logic
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
});
```

## Important Notes

1. **Build System:** All packages use `tsdown` for building (powered by rolldown)
2. **Client Package:** 
   - Builds to both IIFE (`dist/client.js`) and ESM (`dist/index.mjs`) formats
   - IIFE format is used for inline injection by build tool plugins
   - ESM format is available for programmatic usage
3. **ESM Only:** All packages use ES modules
4. **Peer Dependencies:** Vite plugin has Vite as peer dependency
5. **Package Dependencies:** Vite plugin depends on the client package using `workspace:*`
6. **Shadow DOM:** Lit components use shadow DOM by default
7. **Event Composition:** Custom events must use `composed: true` to cross shadow boundaries
8. **No Tests:** Add tests before making breaking changes if possible
9. **No CI/CD:** Manual testing required for now
10. **Build Order:** The client package must be built before the Vite plugin (handled automatically by workspace dependencies)

## Git Workflow

**Commit Messages:** Follow conventional format when possible:
- `feat: add new feature`
- `fix: resolve issue`
- `docs: update documentation`
- `refactor: restructure code`

**No Special Hooks:** No pre-commit or husky setup currently configured
