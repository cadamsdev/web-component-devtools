# CSS Variable Tracking Feature

## Overview

The CSS Variable Tracking feature allows you to inspect, track, and live-edit all CSS custom properties (CSS variables) affecting your web components. This powerful feature helps developers understand the cascade order, inheritance, and sources of CSS variables in their components.

## Features

### 1. **Display All CSS Variables**
- Shows all CSS custom properties that affect a component
- Displays both the declared value and computed value
- Includes variables from multiple sources

### 2. **Show Cascade Order and Inheritance**
The feature displays variables in order of specificity (highest to lowest):
- **Element** (1000): Variables defined directly on the element's inline style
- **Shadow Root** (900): Variables defined in the component's Shadow DOM
- **Element Styles** (varies): Variables from CSS rules matching the element
- **Inherited** (decreasing): Variables inherited from parent elements
- **Root** (10): Variables defined at the `:root` level

### 3. **Source Identification**
Each variable is labeled with its source:
- 🔵 **element**: Defined directly on this element
- 🟣 **shadow-root**: Defined in component's Shadow DOM
- 🔴 **inherited**: Inherited from a parent element
- 🟢 **root**: Defined at document root level

### 4. **Live Editing**
- Click on any element-level variable value to edit it
- Changes are applied immediately to the component
- See the effect in real-time

### 5. **Additional Information**
- **CSS Selector**: Shows which CSS rule defines the variable
- **Computed Value**: Shows the final computed value if different from declared
- **Inherited From**: Shows which parent element the variable is inherited from (clickable to navigate)

## How to Use

### Viewing CSS Variables

1. Open the Web Component Dev Tools panel
2. Select a component to inspect
3. Expand the component details
4. Scroll to the "CSS Variables" section

### Editing Variables

1. Find a variable with the "element" source badge
2. Click on the variable value
3. Edit the value in the input field
4. Press Enter to apply or Escape to cancel

### Understanding the Cascade

Variables are displayed in cascade order:
```
CSS Variables (12)
├─ --button-padding: 12px 24px          [element]
├─ --button-font-size: 16px             [shadow-root]
├─ --primary-color: #667eea             [root]
└─ --text-color: #2d3748                [inherited from <div>]
```

## Example

### Component with CSS Variables

```typescript
@customElement('my-button')
export class MyButton extends LitElement {
  static styles = css`
    :host {
      --button-padding: 12px 24px;
      --button-font-size: 16px;
      --button-border-radius: 8px;
    }

    button {
      padding: var(--button-padding);
      font-size: var(--button-font-size);
      border-radius: var(--button-border-radius);
    }
  `;
}
```

### Global CSS Variables

```css
:root {
  --primary-color: #667eea;
  --text-color: #2d3748;
}
```

### Result in Dev Tools

The CSS Variables section will show:
- Component-level variables (from `:host`)
- Global variables (from `:root`)
- Any inherited variables from parent elements
- All in proper cascade order

## Benefits

1. **Debug CSS Variable Issues**: Quickly identify which variable is being used and where it comes from
2. **Understand Inheritance**: See the complete inheritance chain for CSS variables
3. **Live Testing**: Experiment with different variable values without editing source code
4. **Component Theming**: Understand which variables can be customized for theming
5. **Performance**: Identify redundant or unused CSS variables

## Implementation Details

The feature works by:
1. Analyzing computed styles of the element
2. Extracting CSS variables from:
   - Inline styles
   - Shadow DOM stylesheets
   - Document stylesheets
   - Parent element styles
   - `:root` styles
3. Calculating specificity for proper cascade ordering
4. Providing a UI for inspection and editing

## Browser Compatibility

This feature works in all modern browsers that support:
- Web Components / Shadow DOM
- CSS Custom Properties (CSS Variables)
- Constructable Stylesheets (for adopted stylesheets)

## Limitations

1. Only element-level inline variables can be edited
2. Variables from external stylesheets are read-only
3. Cross-origin stylesheets cannot be inspected (security restriction)
4. Editing creates inline styles which have high specificity

## Future Enhancements

- [ ] Add ability to export all CSS variables as JSON
- [ ] Add search/filter functionality for variables
- [ ] Show variable usage count in the component
- [ ] Add "copy to clipboard" functionality
- [ ] Support for editing variables at different levels
- [ ] Visual color picker for color values
- [ ] Unit converter for different CSS units
