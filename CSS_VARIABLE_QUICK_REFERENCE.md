# CSS Variable Tracking - Quick Reference

## What You Can Do

### 📋 View All CSS Variables
See every CSS custom property that affects a component, including:
- Variables defined in the component's Shadow DOM
- Variables inherited from parent elements  
- Global variables from `:root`
- Inline style variables

### 🔍 Understand the Cascade
Variables are shown in order of precedence:
1. **Element** (highest) - Inline styles
2. **Shadow Root** - Component's Shadow DOM
3. **Inherited** - Parent elements (with navigation)
4. **Root** (lowest) - Global `:root` variables

### ✏️ Live Edit Variables
- Click any element-level variable to edit
- See changes instantly in the component
- Press Enter to save, Escape to cancel
- Supports undo/redo (Ctrl+Z / Ctrl+Y)

## Visual Guide

```
┌─ CSS Variables (12) ──────────────────────────┐
│                                                │
│  --button-padding: 12px 24px     [element]    │
│  ─────────────────────────────                │
│  Source: element | Selector: none             │
│                                                │
│  --button-gradient-start: #667eea             │
│  ──────────────────────────────   [shadow-root]│
│  Computed: #667eea                             │
│  Source: shadow-root | Selector: :host         │
│                                                │
│  --primary-color: #667eea          [root]     │
│  ──────────────────────────                   │
│  Source: root | Selector: :root                │
│                                                │
│  --text-color: #2d3748        [inherited ↑]   │
│  ──────────────────────────                   │
│  Source: inherited | From: <div>               │
│  (click to navigate)                           │
└────────────────────────────────────────────────┘
```

## Color Badges

- 🔵 **Blue (element)** - Editable, highest priority
- 🟣 **Purple (shadow-root)** - Component styles, read-only
- 🔴 **Red (inherited)** - From parent, clickable to navigate
- 🟢 **Green (root)** - Global, lowest priority

## Tips

1. **Find Overrides**: Look for duplicate variable names at different levels
2. **Debug Inheritance**: Click inherited badges to see where they come from
3. **Quick Theming**: Edit element-level variables for instant visual changes
4. **Export Settings**: Copy computed values to use in your code

## Common Use Cases

### Theming
```css
/* Override component theme */
my-button {
  --button-gradient-start: #ff6b6b;
  --button-gradient-end: #ee5a6f;
}
```

### Debugging
```
Problem: Button color not changing
Solution: Check CSS Variables section
- See which variable has higher specificity
- Edit element-level variable to test
- Identify the source of the override
```

### Documentation
Use the dev tools to discover which CSS variables a component supports for theming.

## Keyboard Shortcuts

- **Click** variable value: Start editing
- **Enter**: Save changes
- **Escape**: Cancel editing
- **Ctrl+Z**: Undo last change
- **Ctrl+Y**: Redo change
- **Hover** inherited badge: Highlight parent element
- **Click** inherited badge: Scroll to parent

## Browser Support

✅ Chrome/Edge 90+
✅ Firefox 88+
✅ Safari 14+
✅ All browsers with Web Components support
