# Render Count On-Page Overlay - Quick Guide

## Visual Overview

The render count overlay system displays real-time render counts directly on your web components as they appear on the page.

## UI Controls

### Toggle Buttons (in Dev Tools Panel)

1. **Render Tracking Toggle (#)**
   - Icon: Circle with "#" symbol
   - Function: Enable/disable render counting
   - Active state: Pink/purple gradient background
   - Location: Components tab toolbar

2. **Overlay Toggle (📍)**
   - Icon: Rectangle with badge
   - Function: Show/hide on-page render count badges
   - Active state: Purple gradient background
   - Location: Components tab toolbar, next to tracking toggle
   - Note: Only works when render tracking is enabled

## How It Works

### Step-by-Step Usage

1. **Enable Tracking**
   ```
   Click # button → Starts counting re-renders
   ```

2. **Show Overlays**
   ```
   Click 📍 button → Badges appear on components
   ```

3. **Interact with Components**
   ```
   Change attributes, properties, or content
   → Badges flash and update in real-time
   ```

4. **Hide Overlays (Optional)**
   ```
   Click 📍 button again → Badges disappear
   (Render counting continues in background)
   ```

5. **Disable Tracking**
   ```
   Click # button again → Stops counting
   → Overlays automatically hide
   ```

## Badge Appearance

### Visual Design
```
┌──────────┐
│    5     │  ← Render count
└──────────┘
```

- **Position**: Top-right corner of component
- **Color**: Pink-to-red gradient (#f093fb → #f5576c)
- **Shape**: Rounded pill
- **Size**: 28px height, auto width
- **Shadow**: White border (2px) + soft glow
- **Font**: Bold, 12px

### Animations

**On Render Event:**
1. Badge scales up (1.0 → 1.3)
2. Glow intensifies
3. Returns to normal size
4. Duration: 0.5 seconds

**Continuous:**
- Subtle pulse effect (optional, CSS animation)

## Positioning System

### Automatic Position Updates

The overlays automatically reposition when:
- ✅ User scrolls the page
- ✅ Window is resized
- ✅ Components move in the DOM
- ✅ New components are added

### Visibility Logic

Badges are only shown when:
- ✅ Component is in viewport
- ✅ Component has positive dimensions
- ✅ Overlay toggle is enabled
- ✅ Render tracking is enabled

Hidden when:
- ❌ Component is scrolled out of view
- ❌ Component has zero size (display: none, etc.)
- ❌ Either toggle is disabled

## Use Cases

### Performance Debugging
```
Scenario: Button re-renders excessively
Visual: Badge shows "47" in red
Action: Investigate event handlers and state
```

### Optimization Validation
```
Before: Badge shows "20" during interaction
After optimization: Badge shows "2"
Visual confirmation of improvement
```

### Multiple Component Comparison
```
Grid of components with varying counts:
Card 1: "0" (static)
Card 2: "3" (moderate)
Card 3: "15" (excessive - investigate!)
```

### Real-time Monitoring
```
During user interaction:
- Watch badges update live
- Identify which components react
- Spot unexpected re-renders
```

## Technical Details

### Performance Impact

**Overlay System:**
- Minimal: Uses CSS transforms for positioning
- No layout thrashing: Fixed positioning
- Efficient: Only visible overlays are updated
- Cleanup: Removes overlays when components unmounted

**Event Listeners:**
- Scroll: Uses passive listeners (no blocking)
- Resize: Debounced to prevent excessive updates
- Mutation: Only tracks custom elements (filtered)

### Z-Index Hierarchy

```
999999 - Dev Tools Button
999998 - Dev Tools Panel
999997 - Render Overlays ← Positioned here
999996 - (Available)
```

Overlays sit just below the panel to avoid interference.

### Memory Management

- **WeakMaps**: Automatic garbage collection
- **Cleanup**: Observers removed when components unmounted
- **No Leaks**: References released properly

## Keyboard Shortcuts (Future)

Planned shortcuts for quick toggle:
```
Ctrl/Cmd + Shift + R - Toggle render tracking
Ctrl/Cmd + Shift + O - Toggle overlays
Ctrl/Cmd + Shift + C - Clear all counts
```

## Troubleshooting

### Overlays Not Showing

**Check:**
1. Is render tracking enabled? (# button should be highlighted)
2. Is overlay toggle enabled? (📍 button should be highlighted)
3. Are components in viewport? (Scroll to them)
4. Have components re-rendered yet? (Interact with them)

### Overlays in Wrong Position

**Cause:** Component moved after overlay was positioned
**Solution:** Automatic - overlays update on scroll/resize

**If persists:**
- Toggle overlays off and on again
- Check if component has unusual positioning (fixed, absolute)

### Performance Issues

**If page feels slow:**
1. Disable overlays (click 📍 button)
2. Keep tracking enabled for panel counts only
3. Only enable overlays when actively debugging

### Overlays Behind Content

**Issue:** Z-index conflict with page content
**Fix:** Overlays use z-index 999997 (very high)
**If still behind:** Page has elements with higher z-index

## Best Practices

### When to Use Overlays

✅ **Good for:**
- Identifying specific components with issues
- Visual debugging during interactions
- Comparing multiple similar components
- Recording videos/demos of performance issues

❌ **Avoid for:**
- Long debugging sessions (use panel badges)
- Pages with many components (cluttered)
- Components that move frequently (distracting)

### Workflow Tips

1. **Start with tracking only** (# button)
   - Get baseline counts in panel
   - Identify problem components

2. **Enable overlays for specific testing** (📍 button)
   - Focus on problem areas
   - Run specific interaction scenarios

3. **Disable overlays when not needed**
   - Reduce visual clutter
   - Maintain performance

4. **Use in combination with browser DevTools**
   - Overlays: What is re-rendering
   - Performance tab: Why and how long

## Customization (Future)

Potential settings for future versions:
- Badge position (top-left, bottom-right, etc.)
- Badge color themes
- Show/hide specific components
- Threshold alerts (e.g., warn if count > 10)
- Custom badge content (count, delta, rate, etc.)
