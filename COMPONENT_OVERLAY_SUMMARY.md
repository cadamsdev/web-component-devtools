# Component Overlay - Quick Summary

## What It Does
Displays web component tag names in the **top-left corner** of each component on the page.

## How to Use
1. Open the Web Component Dev Tools panel
2. Click the **Component Overlay toggle button** (rectangle with horizontal lines icon)
3. Tag names will appear on all web components on the page

## Key Features
✅ **Scrolls with content** - Overlays stay attached to components as you scroll
✅ **Auto-updates** - Refreshes when DOM changes
✅ **Performance optimized** - Uses `requestAnimationFrame` for smooth updates
✅ **Non-intrusive** - No interference with page interactions

## Technical Details
- **Position**: Absolute (scrolls with page content)
- **Location**: Top-left corner of each component (4px offset)
- **Styling**: Green gradient background, white monospace text
- **Format**: `<tag-name>` (e.g., `<my-button>`, `<custom-card>`)

## Positioning Fix
The overlays now use **absolute positioning** instead of fixed, which means:
- Overlays move naturally when you scroll the page
- They stay perfectly aligned with their components
- Better performance (only updates on resize, not every scroll frame)
- Uses `window.pageXOffset` and `window.pageYOffset` to calculate positions

This ensures the tag name badges scroll with the page content and stay attached to their respective components!
