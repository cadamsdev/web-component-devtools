# Render Count Tracking Feature

## Overview

The render count tracking feature helps developers monitor and optimize web component performance by tracking how many times each component re-renders during runtime.

## How to Use

### Enabling Render Tracking

1. Open the Web Component Dev Tools panel by clicking the ⚡ button
2. In the toolbar (Components tab), click the **#** button to enable render tracking
3. The button will highlight when tracking is active
4. Each component will now display a render count badge when it re-renders

### Reading Render Counts

When tracking is enabled, components that have re-rendered will show a colorful badge:

**In the Dev Tools Panel:**
- Format: `X renders` or `1 render`
- Color: Pink/purple gradient with a subtle pulse animation
- Location: Next to the component name in the panel list
- Tooltip: Hover over the badge to see the exact count

**On the Page (Optional):**
1. Click the **📍** button (overlay toggle) to show badges directly on components
2. Badges appear at the top-right corner of each component
3. Badges flash and pulse when the component re-renders
4. Overlays automatically update positions on scroll/resize
5. Click the button again to hide the on-page badges

### Disabling Render Tracking

Click the **#** button again to disable tracking. The render counts will stop incrementing, but existing counts will remain visible until you close/reopen the panel. The on-page overlays will automatically hide when tracking is disabled.

## What Triggers a Re-render Count?

The tracker monitors several types of changes:

1. **Attribute Changes**: When any attribute on the component is modified
2. **Property Changes**: When component properties are updated (checked periodically)
3. **Child List Changes**: When child elements are added or removed
4. **Content Updates**: When the component's content changes

## Performance Considerations

### Minimal Impact
- The render tracker is optimized to have minimal performance impact
- It uses efficient MutationObserver APIs and WeakMaps
- Property checking runs at a 500ms interval (not on every frame)

### Best Practices
- **Enable only when needed**: Toggle tracking off when you're not actively debugging
- **Focus on high counts**: Components with many re-renders may indicate:
  - Inefficient state management
  - Unnecessary prop/attribute updates
  - Missing memoization
  - Event handler issues

## Technical Implementation

### Architecture

```
RenderTracker (render-tracker.ts)
├── WeakMap<Element, RenderInfo> - Stores render counts per component
├── Map<Element, MutationObserver> - Observers for each tracked component
├── Polling mechanism - Checks for property changes every 500ms
└── DOM watcher - Detects new components and cleans up removed ones

RenderOverlay (render-overlay.ts)
├── WeakMap<Element, HTMLDivElement> - Maps components to overlay badges
├── Fixed position container - Holds all overlay badges
├── Position updater - Tracks scroll/resize to reposition overlays
└── Flash animations - Visual feedback on render events
```

### Key Features

1. **Automatic Component Discovery**: Automatically detects and tracks new web components added to the DOM
2. **Memory Efficient**: Uses WeakMaps to prevent memory leaks
3. **Cleanup**: Automatically disconnects observers for removed components
4. **Snapshot Comparison**: Captures component state to detect meaningful changes
5. **On-Page Overlays**: Visual badges positioned directly on components in the viewport
6. **Responsive**: Overlays automatically reposition on scroll and window resize

### API

```typescript
class RenderTracker {
  enable(): void           // Start tracking all components
  disable(): void          // Stop tracking and cleanup
  toggle(): void           // Toggle tracking on/off
  isEnabled(): boolean     // Check if tracking is active
  getRenderCount(element: Element): number  // Get count for specific component
  resetCounts(): void      // Reset all render counts to zero
}
```

## Integration Points

The render tracking feature integrates with:

1. **client.ts**: Main initialization and toggle handling
2. **scanner.ts**: Includes render count in component scans
3. **ui.ts**: Displays render count badge in component headers
4. **styles.ts**: Styling for badge and toggle button
5. **types.ts**: Type definitions for render count data

## Visual Design

### Toggle Button
- Icon: Circle with "#" symbol
- Inactive: White background, gray border
- Active: Pink/purple gradient background, white icon
- Hover: Slight lift effect

### Render Count Badge
- Gradient: Pink to red (`#f093fb` → `#f5576c`)
- Animation: Subtle pulse effect (2s loop)
- Shadow: Soft glow for visibility
- Typography: Small, uppercase, bold

## Future Enhancements

Potential improvements for future versions:

1. **Render Timeline**: Show when renders occurred over time
2. **Render Reasons**: Indicate which change triggered each render
3. **Performance Metrics**: Measure render duration
4. **Comparison Mode**: Compare render counts across components
5. **Export Data**: Export render statistics for analysis
6. **Threshold Alerts**: Warn when render count exceeds a threshold
7. **Render Diff**: Show what changed between renders

## Troubleshooting

### Counts Not Updating
- Ensure tracking is enabled (button should be highlighted)
- Check if the component is actually re-rendering (try changing attributes)
- Some property changes may not be detected if they're private or computed

### High Memory Usage
- Disable tracking when not in use
- Tracking adds minimal overhead but can accumulate data over long sessions
- Close and reopen the panel to reset all counts

### Inaccurate Counts
- Property change detection uses polling (500ms interval)
- Very rapid changes may be batched into a single count
- Some internal component updates may not trigger a count

## Example Use Cases

### Identifying Performance Issues
```typescript
// Component re-renders 50+ times when interacting with a form
// → Indicates excessive updates, check event handlers

// Component never re-renders despite prop changes
// → May indicate missing reactivity or stale references
```

### Validating Optimizations
```typescript
// Before optimization: 20 renders per user action
// After memoization: 2 renders per user action
// → Confirms optimization was effective
```

### Debugging Race Conditions
```typescript
// Component has irregular render counts across instances
// → May indicate async timing issues or event propagation problems
```

## Related Documentation

- [README.md](./README.md) - Main project documentation
- [CSS_VARIABLE_TRACKING.md](./CSS_VARIABLE_TRACKING.md) - CSS variable tracking feature
- [ROADMAP.md](./ROADMAP.md) - Future development plans
