# Component Overlay Guide

The Component Overlay feature allows you to visualize all web components on your page by displaying their tag names directly on the page.

## Overview

When enabled, the component overlay displays a small badge in the **top-left corner** of each web component on the page showing its tag name (e.g., `<my-button>`, `<custom-card>`).

## Features

- **Visual Component Discovery**: Quickly see all web components on your page at a glance
- **Tag Name Display**: Shows the exact tag name of each component (e.g., `<my-element>`)
- **Dynamic Positioning**: Badges automatically adjust position on scroll and resize
- **DOM Change Detection**: Automatically updates when components are added or removed
- **Non-intrusive**: Badges are positioned with `pointer-events: none` so they don't interfere with interactions

## How to Use

### Toggle Component Overlay

Click the **Component Overlay Toggle** button in the dev tools panel (it's the button with a rectangle and horizontal lines icon, located in the toolbar next to the render tracking buttons).

The toggle button is located in the Components tab toolbar:
- **Undo** button (↶)
- **Redo** button (↷)  
- **Render Tracking** button (#)
- **Render Overlay** button (rectangle with # badge in corner)
- **Component Overlay** button (rectangle with horizontal lines) ← **NEW!**

### Button States

- **Inactive** (white background): Component overlays are hidden
- **Active** (green gradient): Component overlays are visible
- **Tooltip**: 
  - When inactive: "Show component tag names on page"
  - When active: "Hide component tag names on page"

## Visual Design

The component overlays have the following styling:
- **Position**: Top-left corner of each component (4px offset from top and left)
- **Background**: Green gradient (`linear-gradient(135deg, #48bb78 0%, #38a169 100%)`)
- **Font**: Monaco/Courier New monospace, 11px, bold, white text
- **Shadow**: Subtle drop shadow with white border
- **Format**: Shows tag name in angle brackets (e.g., `<my-button>`)

## Implementation Details

### Component Structure

The overlay system consists of:

1. **ComponentOverlay Class** (`component-overlay.ts`)
   - Manages overlay lifecycle (enable/disable/toggle)
   - Creates and positions overlay badges for each component
   - Handles scroll and resize events to keep badges positioned correctly
   - Automatically refreshes when DOM changes

2. **UI Integration** (`client.ts`)
   - Adds toggle button to toolbar
   - Connects button to ComponentOverlay instance
   - Refreshes overlays when DOM changes are detected

3. **Styling** (`styles.ts`)
   - Green gradient background for active button state
   - Overlay badge styling with monospace font
   - Responsive positioning and visibility

### DOM Filtering

The overlay system intelligently filters out:
- DevTools UI elements (`#wc-devtools-btn`, `#wc-devtools-panel`)
- Render overlay container
- Component overlay container itself
- Any element inside the DevTools panel

### Performance

- Uses `WeakMap` to track overlays for efficient garbage collection
- Only updates visible elements (checks viewport bounds)
- Debounced position updates on scroll
- Efficient TreeWalker for component discovery

## Use Cases

### 1. **Component Discovery**
Quickly see what web components are being used on a page and where they're located.

### 2. **Layout Debugging**
Understand component hierarchy and positioning by seeing all components at once.

### 3. **Testing & QA**
Verify that the correct components are rendered in the right locations.

### 4. **Learning & Documentation**
When exploring a new codebase, quickly identify custom components and their names.

### 5. **Development**
While building, verify components are being created and positioned correctly.

## Comparison with Render Overlay

| Feature | Component Overlay | Render Overlay |
|---------|------------------|----------------|
| **Purpose** | Show component tag names | Show render counts |
| **Position** | Top-left corner | Top-right corner |
| **Color** | Green gradient | Pink/red gradient |
| **Content** | `<tag-name>` | Render count number |
| **Requires** | Always available | Requires render tracking enabled |
| **Updates** | On DOM changes | On component re-renders |

## Tips

1. **Use Both Overlays**: Enable both component and render overlays together to see both tag names and render counts
2. **Scroll Testing**: Overlays stay positioned correctly when scrolling, making it easy to track components throughout the page
3. **Combine with Highlighting**: Hover over components in the DevTools panel to highlight them on the page while overlays are visible
4. **DOM Changes**: Overlays automatically refresh when components are added or removed from the DOM

## Technical Notes

- **Z-index**: Component overlays use `z-index: 999996` (one level below render overlays at 999997)
- **Container ID**: `wc-component-overlay-container`
- **Overlay Class**: `.wc-component-overlay`
- **Toggle Button ID**: `wc-component-overlay-toggle`

## Future Enhancements

Potential improvements for future versions:

- [ ] Customizable overlay position (top-left, top-right, bottom-left, bottom-right)
- [ ] Color coding by component library or namespace
- [ ] Click-through to select component in DevTools panel
- [ ] Show additional component metadata (state, props count, etc.)
- [ ] Filter overlays by component name pattern
- [ ] Export screenshot with overlays visible
