// Component Overlay - Display tag names directly on components in the page

export class ComponentOverlay {
  private overlays: WeakMap<Element, HTMLDivElement> = new WeakMap();
  private enabled: boolean = false;
  private container: HTMLDivElement | null = null;
  private updateScheduled: boolean = false;
  private onOverlayClick?: (element: Element) => void;

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
   * Show overlays for all web components on the page
   */
  showAllComponents(): void {
    if (!this.enabled) return;

    // Clear existing overlays
    this.clearAll();

    // Get all web components
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
      this.createOrUpdateOverlay(element);
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

    // Get all web components
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
      const overlay = this.overlays.get(element);
      if (overlay) {
        this.positionOverlay(element, overlay);
      }
    }
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
    overlay.setAttribute('data-element-tag', tagName);
    overlay.textContent = `<${tagName}>`;

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
    });

    overlay.addEventListener('mouseleave', () => {
      overlay.style.transform = 'scale(1)';
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
