# Client Source Structure

This directory contains the refactored Web Component Dev Tools client code, organized into modular files for better maintainability.

## File Structure

```
src/
├── client.ts         # Main entry point and orchestration
├── types.ts          # TypeScript interfaces and type definitions
├── styles.ts         # CSS styles injection
├── ui.ts             # UI component creation and rendering
├── scanner.ts        # Web component scanning logic
├── event-monitor.ts  # Event monitoring functionality
├── utils.ts          # Utility functions
└── index.ts          # Public API exports
```

## Module Responsibilities

### `client.ts` (Main Entry Point)
- Orchestrates all modules
- Initializes the dev tools
- Manages global state (expanded states, search filter)
- Sets up event listeners for dragging and panel toggling
- Handles panel positioning logic
- Watches for DOM changes

### `types.ts`
- Type definitions for the entire application
- Interfaces: `InstanceInfo`, `EventLog`, `DevToolsConfig`, `DevToolsState`

### `styles.ts`
- CSS injection function
- All visual styles for the dev tools UI
- Position calculation helpers

### `ui.ts`
- UI component creation functions
- `createButton()` - Creates the floating button
- `createPanel()` - Creates the main panel
- `createStatsElement()` - Creates statistics display
- `createInstanceElement()` - Creates component instance cards
- `createEventLogElement()` - Creates event log entries

### `scanner.ts`
- Web component discovery and inspection
- `scanWebComponents()` - Finds all custom elements in the DOM
- Extracts attributes, properties, methods, and slots

### `event-monitor.ts`
- Event monitoring class (`EventMonitor`)
- Tracks custom events from web components
- Manages event listeners lifecycle
- Maintains event log history

### `utils.ts`
- Utility functions used across modules
- Element highlighting/unhighlighting
- Value formatting and type detection
- Timestamp and event detail formatting

## Benefits of This Structure

1. **Separation of Concerns**: Each file has a single, clear responsibility
2. **Easier Testing**: Individual modules can be tested in isolation
3. **Better Maintainability**: Changes to one area don't affect others
4. **Improved Readability**: Smaller files are easier to understand
5. **Reusability**: Modules can be imported and used independently

## Usage

The main entry point is still `client.ts`, which exports the `initDevTools()` function:

```typescript
import { initDevTools } from './client';

initDevTools({ position: 'bottom-right' });
```

The build process bundles all modules together into a single file for distribution.
