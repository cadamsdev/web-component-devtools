// Render Tracker for Web Component Dev Tools
// Tracks how many times a component has re-rendered

import type { RenderOverlay } from './render-overlay';

interface RenderInfo {
  count: number;
  lastRenderTime: number;
}

export class RenderTracker {
  private renderCounts: WeakMap<Element, RenderInfo> = new WeakMap();
  private observers: Map<Element, MutationObserver[]> = new Map();
  private attributeSnapshots: WeakMap<Element, Map<string, string | null>> = new WeakMap();
  private propertySnapshots: WeakMap<Element, Map<string, unknown>> = new WeakMap();
  private enabled: boolean = false;
  private overlay: RenderOverlay | null = null;
  private lastIncrementTime: WeakMap<Element, number> = new WeakMap();
  private hasLitLifecycle: WeakMap<Element, boolean> = new WeakMap();
  private onRenderCallback: ((element: Element, count: number) => void) | null = null;

  /**
   * Set the render overlay instance
   */
  setOverlay(overlay: RenderOverlay): void {
    this.overlay = overlay;
  }

  /**
   * Set a callback to be called when a render count is incremented
   */
  setOnRenderCallback(callback: (element: Element, count: number) => void): void {
    this.onRenderCallback = callback;
  }

  /**
   * Enable render tracking for all web components
   */
  enable(): void {
    if (this.enabled) return;
    this.enabled = true;
    this.startTracking();
  }

  /**
   * Disable render tracking and clean up observers
   */
  disable(): void {
    if (!this.enabled) return;
    this.enabled = false;
    this.stopTracking();
  }

  /**
   * Check if tracking is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Toggle tracking on/off
   */
  toggle(): void {
    if (this.enabled) {
      this.disable();
    } else {
      this.enable();
    }
  }

  /**
   * Get render count for a specific element
   */
  getRenderCount(element: Element): number {
    const info = this.renderCounts.get(element);
    return info?.count || 0;
  }

  /**
   * Get all tracked elements with their render counts
   */
  getAllTrackedElements(): Array<{ element: Element; count: number }> {
    const tracked: Array<{ element: Element; count: number }> = [];

    // We need to iterate through all tracked observers to get elements
    this.observers.forEach((observer, element) => {
      if (element !== document.body) {
        // Skip the global observer
        const count = this.getRenderCount(element);
        tracked.push({ element, count });
      }
    });

    return tracked;
  }

  /**
   * Reset render counts for all elements
   */
  resetCounts(): void {
    this.renderCounts = new WeakMap();

    // Clear overlays if they exist
    if (this.overlay) {
      this.overlay.clearAll();
    }
  }

  /**
   * Start tracking renders for all web components
   */
  private startTracking(): void {
    // Find all existing web components and start tracking them
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, {
      acceptNode: (node) => {
        return (node as Element).nodeName.includes('-')
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_SKIP;
      },
    });

    let node: Node | null;
    while ((node = walker.nextNode())) {
      const element = node as Element;
      this.trackElement(element);
    }

    // Watch for new web components being added
    this.watchForNewComponents();
  }

  /**
   * Stop tracking and clean up all observers
   */
  private stopTracking(): void {
    this.observers.forEach((observerList) => {
      observerList.forEach((observer) => observer.disconnect());
    });
    this.observers.clear();
  }

  /**
   * Track an individual element for renders
   */
  private trackElement(element: Element): void {
    // Skip if already tracking
    if (this.observers.has(element)) return;

    // Initialize observers array for this element
    const observerList: MutationObserver[] = [];

    // Initialize render count to 1 (the component is already rendered when we start tracking)
    if (!this.renderCounts.has(element)) {
      this.renderCounts.set(element, {
        count: 1,
        lastRenderTime: Date.now(),
      });

      // Update overlay immediately if it's enabled
      if (this.overlay && this.overlay.isEnabled()) {
        this.overlay.updateOverlay(element, 1);
      }
    }

    // Capture initial state
    this.captureSnapshot(element);

    // Set up mutation observer for attribute changes
    const observer = new MutationObserver((mutations) => {
      let hasRelevantChange = false;

      for (const mutation of mutations) {
        // Check for attribute changes
        if (mutation.type === 'attributes') {
          hasRelevantChange = true;
          break;
        }

        // Check for child list changes (content changes)
        if (mutation.type === 'childList') {
          hasRelevantChange = true;
          break;
        }
      }

      if (hasRelevantChange) {
        this.incrementRenderCount(element);
        this.captureSnapshot(element);
      }
    });

    observer.observe(element, {
      attributes: true,
      childList: true,
      subtree: false, // Only watch the element itself, not its children
      attributeOldValue: true,
    });

    observerList.push(observer);

    // Hook into Lit lifecycle if it's a Lit component
    this.hookLitLifecycle(element);

    // Watch shadow DOM changes if component has shadow root
    const shadowObserver = this.watchShadowDOM(element);
    if (shadowObserver) {
      observerList.push(shadowObserver);
    }

    // Store all observers for this element
    this.observers.set(element, observerList);

    // Also watch for property changes using a Proxy if possible
    this.watchPropertyChanges(element);
  }

  /**
   * Hook into Lit component lifecycle to detect re-renders
   */
  private hookLitLifecycle(element: Element): void {
    // Check if this is a Lit component (has updated method)
    const elementAsAny = element as any;

    if (typeof elementAsAny.updated === 'function') {
      // Mark as Lit component so we can optimize detection
      this.hasLitLifecycle.set(element, true);

      const originalUpdated = elementAsAny.updated.bind(element);

      // Override the updated method to track re-renders
      elementAsAny.updated = (changedProperties: Map<string, any>) => {
        // Call original method first
        originalUpdated(changedProperties);

        // Only increment if tracking is enabled and properties actually changed
        if (this.enabled && changedProperties && changedProperties.size > 0) {
          this.incrementRenderCount(element);
        }
      };
    }
  }

  /**
   * Watch shadow DOM for changes (for non-Lit components)
   */
  private watchShadowDOM(element: Element): MutationObserver | null {
    // Don't watch shadow DOM if we have Lit lifecycle hook
    // (Lit's updated() method is more accurate and will handle this)
    if (this.hasLitLifecycle.get(element)) {
      return null;
    }

    const shadowRoot = (element as any).shadowRoot;
    if (!shadowRoot) return null;

    // Create a separate observer for shadow DOM changes
    const shadowObserver = new MutationObserver((mutations) => {
      // Filter out our own devtools changes
      const hasRelevantChange = mutations.some((mutation) => {
        const target = mutation.target as Element;
        // Ignore our overlay elements
        if (
          target.id === 'wc-render-overlay-container' ||
          target.closest?.('#wc-render-overlay-container')
        ) {
          return false;
        }
        return true;
      });

      if (hasRelevantChange) {
        this.incrementRenderCount(element);
      }
    });

    shadowObserver.observe(shadowRoot, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
    });

    return shadowObserver;
  }

  /**
   * Capture current state snapshot
   */
  private captureSnapshot(element: Element): void {
    // Capture attributes
    const attributes = new Map<string, string | null>();
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      attributes.set(attr.name, attr.value);
    }
    this.attributeSnapshots.set(element, attributes);

    // Capture properties
    const properties = new Map<string, unknown>();
    const elementAsAny = element as any;
    const proto = Object.getPrototypeOf(element);

    if (proto && proto !== HTMLElement.prototype) {
      const descriptors = Object.getOwnPropertyDescriptors(proto);

      for (const propName in descriptors) {
        const descriptor = descriptors[propName];

        if (
          propName.startsWith('_') ||
          propName === 'constructor' ||
          propName in HTMLElement.prototype
        ) {
          continue;
        }

        if (descriptor.get) {
          try {
            const value = elementAsAny[propName];
            properties.set(propName, value);
          } catch {
            // Skip properties that throw errors
          }
        }
      }
    }

    this.propertySnapshots.set(element, properties);
  }

  /**
   * Watch for property changes (experimental - uses polling)
   */
  private watchPropertyChanges(element: Element): void {
    // Note: This is a simplified approach. In a production environment,
    // you might want to use more sophisticated techniques or hook into
    // the component's lifecycle methods
    const checkInterval = setInterval(() => {
      if (!this.enabled || !document.body.contains(element)) {
        clearInterval(checkInterval);
        return;
      }

      const oldProperties = this.propertySnapshots.get(element);
      if (!oldProperties) return;

      const elementAsAny = element as any;
      const proto = Object.getPrototypeOf(element);

      if (proto && proto !== HTMLElement.prototype) {
        const descriptors = Object.getOwnPropertyDescriptors(proto);

        for (const propName in descriptors) {
          const descriptor = descriptors[propName];

          if (
            propName.startsWith('_') ||
            propName === 'constructor' ||
            propName in HTMLElement.prototype
          ) {
            continue;
          }

          if (descriptor.get) {
            try {
              const currentValue = elementAsAny[propName];
              const oldValue = oldProperties.get(propName);

              if (currentValue !== oldValue) {
                this.incrementRenderCount(element);
                this.captureSnapshot(element);
                return; // Only count once per check cycle
              }
            } catch {
              // Skip properties that throw errors
            }
          }
        }
      }
    }, 500); // Check every 500ms
  }

  /**
   * Increment render count for an element
   */
  private incrementRenderCount(element: Element): void {
    const now = Date.now();
    const lastTime = this.lastIncrementTime.get(element) || 0;

    // Prevent double-counting within 50ms window
    // This handles cases where multiple detection methods fire for the same render
    if (now - lastTime < 50) {
      return;
    }

    this.lastIncrementTime.set(element, now);

    const current = this.renderCounts.get(element) || { count: 0, lastRenderTime: 0 };
    const newCount = current.count + 1;
    this.renderCounts.set(element, {
      count: newCount,
      lastRenderTime: now,
    });

    // Update overlay if available
    if (this.overlay && this.overlay.isEnabled()) {
      this.overlay.updateOverlay(element, newCount);
    }

    // Call the render callback if set
    if (this.onRenderCallback) {
      this.onRenderCallback(element, newCount);
    }
  }

  /**
   * Watch for new components being added to the DOM
   */
  private watchForNewComponents(): void {
    const observer = new MutationObserver((mutations) => {
      if (!this.enabled) return;

      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;

              // Check if it's a web component
              if (element.nodeName.includes('-')) {
                this.trackElement(element);
              }

              // Check for web components in its subtree
              if (element.querySelectorAll) {
                const webComponents = element.querySelectorAll('[is], *');
                webComponents.forEach((wc) => {
                  if (wc.nodeName.includes('-')) {
                    this.trackElement(wc);
                  }
                });
              }
            }
          });

          // Clean up tracking for removed elements
          mutation.removedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              const observerList = this.observers.get(element);
              if (observerList) {
                observerList.forEach((observer) => observer.disconnect());
                this.observers.delete(element);
              }

              // Remove overlay if available
              if (this.overlay) {
                this.overlay.removeOverlay(element);
              }
            }
          });
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Store this observer so we can disconnect it later (as a single-item array)
    this.observers.set(document.body, [observer]);
  }
}
