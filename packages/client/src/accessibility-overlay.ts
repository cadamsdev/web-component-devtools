// Accessibility Overlay for Web Component Dev Tools
// Highlights accessibility issues on the page

import type { A11yIssue } from './accessibility-checker';

export class AccessibilityOverlay {
  private overlays: Map<Element, HTMLDivElement> = new Map();
  private enabled = false;

  /**
   * Show overlay for an accessibility issue
   */
  showIssue(issue: A11yIssue): void {
    if (!issue.element || !this.enabled) return;

    // Remove existing overlay for this element
    this.removeOverlay(issue.element);

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = `wc-a11y-overlay wc-a11y-overlay-${issue.type}`;

    // Position overlay
    this.positionOverlay(overlay, issue.element);

    // Add issue badge
    const badge = document.createElement('div');
    badge.className = 'wc-a11y-overlay-badge';
    badge.textContent = this.getIssueIcon(issue.type);
    badge.title = issue.message;
    overlay.appendChild(badge);

    // Add tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'wc-a11y-overlay-tooltip';
    tooltip.innerHTML = `
      <div class="wc-a11y-overlay-tooltip-header">
        <span class="wc-a11y-overlay-tooltip-type">${issue.type.toUpperCase()}</span>
        <span class="wc-a11y-overlay-tooltip-category">${issue.category}</span>
      </div>
      <div class="wc-a11y-overlay-tooltip-message">${issue.message}</div>
      ${issue.recommendation ? `<div class="wc-a11y-overlay-tooltip-rec">${issue.recommendation}</div>` : ''}
    `;
    overlay.appendChild(tooltip);

    document.body.appendChild(overlay);
    this.overlays.set(issue.element, overlay);

    // Update position on scroll/resize
    const updatePosition = () => this.positionOverlay(overlay, issue.element!);
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    // Store cleanup functions
    (overlay as any)._cleanup = () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }

  /**
   * Remove overlay for an element
   */
  removeOverlay(element: Element): void {
    const overlay = this.overlays.get(element);
    if (overlay) {
      if ((overlay as any)._cleanup) {
        (overlay as any)._cleanup();
      }
      overlay.remove();
      this.overlays.delete(element);
    }
  }

  /**
   * Clear all overlays
   */
  clearAll(): void {
    this.overlays.forEach((overlay) => {
      if ((overlay as any)._cleanup) {
        (overlay as any)._cleanup();
      }
      overlay.remove();
    });
    this.overlays.clear();
  }

  /**
   * Toggle overlay visibility
   */
  toggle(): void {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.clearAll();
    }
  }

  /**
   * Check if overlay is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Position overlay relative to element
   */
  private positionOverlay(overlay: HTMLDivElement, element: Element): void {
    const rect = element.getBoundingClientRect();

    overlay.style.position = 'fixed';
    overlay.style.left = `${rect.left}px`;
    overlay.style.top = `${rect.top}px`;
    overlay.style.width = `${rect.width}px`;
    overlay.style.height = `${rect.height}px`;
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '999999';
  }

  /**
   * Get icon for issue type
   */
  private getIssueIcon(type: string): string {
    switch (type) {
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '•';
    }
  }

  /**
   * Highlight all issues for a set of elements
   */
  highlightIssues(issues: A11yIssue[]): void {
    if (!this.enabled) return;

    this.clearAll();
    issues.forEach((issue) => this.showIssue(issue));
  }
}
