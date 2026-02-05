// Component Overlay - Display tag names directly on components in the page

export class ComponentOverlay {
  private overlays: WeakMap<Element, HTMLDivElement> = new WeakMap();
  private enabled: boolean = false;
  private container: HTMLDivElement | null = null;
  private updateScheduled: boolean = false;
  private onOverlayClick?: (element: Element) => void;
  private componentDepths: WeakMap<Element, number> = new WeakMap();
  private componentInShadowDOM: WeakMap<Element, boolean> = new WeakMap();

  // Color palette for different nesting levels - maximized contrast for easy distinction
  private readonly depthColors = [
    'rgba(239, 68, 68, 0.9)', // Level 0: Red
    'rgba(16, 185, 129, 0.9)', // Level 1: Green
    'rgba(59, 130, 246, 0.9)', // Level 2: Blue
    'rgba(245, 158, 11, 0.9)', // Level 3: Orange
    'rgba(236, 72, 153, 0.9)', // Level 4: Pink
    'rgba(139, 92, 246, 0.9)', // Level 5: Purple
    'rgba(14, 165, 233, 0.9)', // Level 6: Cyan
    'rgba(234, 179, 8, 0.9)', // Level 7: Yellow
  ];

  /**
   * Set callback for when an overlay is clicked
   */
  setOnClickCallback(callback: (element: Element) => void): void {
    this.onOverlayClick = callback;
  }

  /**
   * Enable overlays - show tag names on components
   */
  enable(): void {
    if (this.enabled) return;
    this.enabled = true;
    this.createContainer();
    this.showAllComponents();
  }

  /**
   * Disable overlays - hide all tag names
   */
  disable(): void {
    if (!this.enabled) return;
    this.enabled = false;
    this.removeContainer();
  }

  /**
   * Check if overlays are enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Toggle overlays on/off
   */
  toggle(): void {
    if (this.enabled) {
      this.disable();
    } else {
      this.enable();
    }
  }

  /**
   * Calculate the nesting depth of a component
   * Depth is based on how many parent web components it has
   */
  private calculateDepth(element: Element): number {
    let depth = 0;
    let current: Node | null = element.parentNode;

    while (current) {
      // Check if we're inside a shadow root
      if (current instanceof ShadowRoot) {
        const host = current.host;
        if (host && host.nodeName.includes('-')) {
          depth++;
        }
        current = host.parentNode;
      } else if (current instanceof Element) {
        // Check if parent is a web component
        if (current.nodeName.includes('-') && current !== element) {
          depth++;
        }
        current = current.parentNode;
      } else {
        current = (current as any).parentNode || null;
      }
    }

    return depth;
  }

  /**
   * Check if a component is inside a shadow DOM
   */
  private isInShadowDOM(element: Element): boolean {
    let current: Node | null = element.parentNode;

    while (current) {
      if (current instanceof ShadowRoot) {
        return true;
      }
      current = (current as any).parentNode || null;
    }

    return false;
  }

  /**
   * Show overlays for all web components on the page
   */
  showAllComponents(): void {
    if (!this.enabled) return;

    // Clear existing overlays and depths
    this.clearAll();
    this.componentDepths = new WeakMap();
    this.componentInShadowDOM = new WeakMap();

    // First pass: calculate depths for all components
    const allComponents: Element[] = [];

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, {
      acceptNode: (node) => {
        const element = node as Element;
        // Skip devtools elements
        if (
          element.id === 'wc-devtools-btn' ||
          element.id === 'wc-devtools-panel' ||
          element.closest('#wc-devtools-panel') ||
          element.id === 'wc-component-overlay-container' ||
          element.id === 'wc-render-overlay-container'
        ) {
          return NodeFilter.FILTER_REJECT;
        }
        return element.nodeName.includes('-') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      },
    });

    let node: Node | null;
    while ((node = walker.nextNode())) {
      const element = node as Element;
      allComponents.push(element);
    }

    // Also scan shadow DOMs for nested components
    this.scanShadowDOMsRecursively(document.body, allComponents);

    // Calculate and store depths
    allComponents.forEach((element) => {
      const depth = this.calculateDepth(element);
      const inShadowDOM = this.isInShadowDOM(element);
      this.componentDepths.set(element, depth);
      this.componentInShadowDOM.set(element, inShadowDOM);
    });

    // Second pass: create overlays with depth information
    allComponents.forEach((element) => {
      this.createOrUpdateOverlay(element);
    });
  }

  /**
   * Recursively scan shadow DOMs to find nested components
   */
  private scanShadowDOMsRecursively(root: Node, components: Element[]): void {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
      acceptNode: (node) => {
        const element = node as Element;
        // Skip devtools elements
        if (
          element.id === 'wc-devtools-btn' ||
          element.id === 'wc-devtools-panel' ||
          element.closest('#wc-devtools-panel') ||
          element.id === 'wc-component-overlay-container' ||
          element.id === 'wc-render-overlay-container'
        ) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    let node: Node | null;
    while ((node = walker.nextNode())) {
      const element = node as Element;

      // If this element has a shadow root, scan it
      if (element.shadowRoot) {
        const shadowWalker = document.createTreeWalker(
          element.shadowRoot,
          NodeFilter.SHOW_ELEMENT,
          {
            acceptNode: (shadowNode) => {
              const shadowElement = shadowNode as Element;
              return shadowElement.nodeName.includes('-')
                ? NodeFilter.FILTER_ACCEPT
                : NodeFilter.FILTER_SKIP;
            },
          },
        );

        let shadowNode: Node | null;
        while ((shadowNode = shadowWalker.nextNode())) {
          const shadowElement = shadowNode as Element;
          components.push(shadowElement);
        }

        // Recursively scan this shadow DOM for more nested shadow DOMs
        this.scanShadowDOMsRecursively(element.shadowRoot, components);
      }
    }
  }

  /**
   * Create or update an overlay for a specific element
   */
  private createOrUpdateOverlay(element: Element): void {
    if (!this.enabled) return;

    // Ensure container exists
    if (!this.container) {
      this.createContainer();
    }

    if (!this.container) return; // Safety check

    let overlay = this.overlays.get(element);

    // Create overlay if it doesn't exist
    if (!overlay) {
      overlay = this.createOverlay(element);
      this.overlays.set(element, overlay);
    }

    // Update position
    this.positionOverlay(element, overlay);
  }

  /**
   * Remove overlay for a specific element
   */
  removeOverlay(element: Element): void {
    const overlay = this.overlays.get(element);
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
      this.overlays.delete(element);
    }
  }

  /**
   * Clear all overlays
   */
  clearAll(): void {
    if (this.container) {
      this.container.innerHTML = '';
    }
    this.overlays = new WeakMap();
  }

  /**
   * Update all overlay positions (call on scroll/resize)
   */
  updateAllPositions(): void {
    if (!this.enabled || !this.container) return;

    // Get all web components including nested ones in shadow DOM
    const allComponents: Element[] = [];

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, {
      acceptNode: (node) => {
        const element = node as Element;
        // Skip devtools elements
        if (
          element.id === 'wc-devtools-btn' ||
          element.id === 'wc-devtools-panel' ||
          element.closest('#wc-devtools-panel') ||
          element.id === 'wc-component-overlay-container' ||
          element.id === 'wc-render-overlay-container'
        ) {
          return NodeFilter.FILTER_REJECT;
        }
        return element.nodeName.includes('-') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      },
    });

    let node: Node | null;
    while ((node = walker.nextNode())) {
      const element = node as Element;
      allComponents.push(element);
    }

    // Also scan shadow DOMs
    this.scanShadowDOMsRecursively(document.body, allComponents);

    // Update positions for all components
    allComponents.forEach((element) => {
      const overlay = this.overlays.get(element);
      if (overlay) {
        this.positionOverlay(element, overlay);
      }
    });
  }

  /**
   * Refresh all overlays (useful when DOM changes)
   */
  refresh(): void {
    if (!this.enabled) return;
    this.showAllComponents();
  }

  /**
   * Create the container for all overlays
   */
  private createContainer(): void {
    if (this.container) return;

    this.container = document.createElement('div');
    this.container.id = 'wc-component-overlay-container';
    this.container.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 999996;
    `;
    document.body.appendChild(this.container);

    // Update positions on scroll and resize
    window.addEventListener('scroll', this.handleScroll, true);
    window.addEventListener('resize', this.handleResize);
  }

  /**
   * Remove the container and cleanup
   */
  private removeContainer(): void {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
      this.container = null;
    }

    window.removeEventListener('scroll', this.handleScroll, true);
    window.removeEventListener('resize', this.handleResize);

    this.clearAll();
  }

  /**
   * Create an overlay element for a component
   */
  private createOverlay(element: Element): HTMLDivElement {
    const overlay = document.createElement('div');
    overlay.className = 'wc-component-overlay';

    const tagName = element.tagName.toLowerCase();
    const depth = this.componentDepths.get(element) || 0;
    const inShadowDOM = this.componentInShadowDOM.get(element) || false;

    overlay.setAttribute('data-element-tag', tagName);
    overlay.setAttribute('data-depth', depth.toString());
    overlay.setAttribute('data-in-shadow-dom', inShadowDOM.toString());

    // Add icon prefix for shadow DOM components
    overlay.textContent = inShadowDOM ? `◆ <${tagName}>` : `<${tagName}>`;

    // Get color based on depth
    const color = this.depthColors[depth % this.depthColors.length];

    // Apply styles with depth-based color and shadow DOM visual indicator
    const borderStyle = inShadowDOM ? '2px solid rgba(139, 92, 246, 0.8)' : 'none';

    overlay.style.cssText = `
      position: absolute;
      padding: 4px 8px;
      background: ${color};
      color: white;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
      font-size: 12px;
      font-weight: 600;
      border-radius: 4px;
      white-space: nowrap;
      pointer-events: auto;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      z-index: ${999996 + depth};
      border: ${borderStyle};
    `;

    // Make overlay clickable
    overlay.style.pointerEvents = 'auto';
    overlay.style.cursor = 'pointer';

    // Add click handler
    overlay.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (this.onOverlayClick) {
        this.onOverlayClick(element);
      }
    });

    // Add hover effect
    overlay.addEventListener('mouseenter', () => {
      overlay.style.transform = 'scale(1.05)';
      overlay.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.25)';
    });

    overlay.addEventListener('mouseleave', () => {
      overlay.style.transform = 'scale(1)';
      overlay.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
    });

    if (this.container) {
      this.container.appendChild(overlay);
    }

    return overlay;
  }

  /**
   * Position an overlay relative to its element
   */
  private positionOverlay(element: Element, overlay: HTMLDivElement): void {
    const rect = element.getBoundingClientRect();

    // Check if element is visible
    const isVisible = rect.width > 0 && rect.height > 0;

    if (!isVisible) {
      overlay.style.display = 'none';
      return;
    }

    overlay.style.display = 'flex';

    // Position at top-left corner of the element using absolute positioning
    // Add scroll offsets to convert viewport coordinates to document coordinates
    const left = rect.left + window.pageXOffset + 4; // Small offset from left
    const top = rect.top + window.pageYOffset + 4; // Small offset from top

    overlay.style.left = `${left}px`;
    overlay.style.top = `${top}px`;
  }

  /**
   * Handle scroll events with requestAnimationFrame for smooth updates
   */
  private handleScroll = (): void => {
    if (this.updateScheduled) return;

    this.updateScheduled = true;
    requestAnimationFrame(() => {
      this.updateAllPositions();
      this.updateScheduled = false;
    });
  };

  /**
   * Handle resize events
   */
  private handleResize = (): void => {
    if (this.updateScheduled) return;

    this.updateScheduled = true;
    requestAnimationFrame(() => {
      this.updateAllPositions();
      this.updateScheduled = false;
    });
  };
}
