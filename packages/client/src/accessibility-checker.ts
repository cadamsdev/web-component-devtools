// Accessibility Checker for Web Component Dev Tools
// Performs A11y audits on web components

import type { InstanceInfo } from './types';

export interface A11yIssue {
  type: 'error' | 'warning' | 'info';
  category: 'aria' | 'keyboard' | 'focus' | 'contrast' | 'semantics';
  message: string;
  element?: Element;
  recommendation?: string;
  wcagLevel?: 'A' | 'AA' | 'AAA';
}

export interface A11yAuditResult {
  element: Element;
  tagName: string;
  issues: A11yIssue[];
  score: number; // 0-100
  hasKeyboardSupport: boolean;
  hasFocusManagement: boolean;
  hasAriaLabels: boolean;
}

export class AccessibilityChecker {
  /**
   * Perform a comprehensive accessibility audit on a web component
   */
  auditComponent(instance: InstanceInfo): A11yAuditResult {
    const issues: A11yIssue[] = [];
    const element = instance.element;

    // Check ARIA attributes
    issues.push(...this.checkAriaAttributes(element, instance));

    // Check keyboard support
    const keyboardIssues = this.checkKeyboardSupport(element);
    issues.push(...keyboardIssues);

    // Check focus management in shadow DOM
    if (instance.shadowDOM?.hasShadowRoot) {
      issues.push(...this.checkShadowDOMFocus(element, instance.shadowDOM));
    }

    // Check contrast issues
    issues.push(...this.checkContrastIssues(element));

    // Check semantic structure
    issues.push(...this.checkSemanticStructure(element, instance));

    // Calculate score based on issues
    const score = this.calculateA11yScore(issues);

    return {
      element,
      tagName: instance.tagName,
      issues,
      score,
      hasKeyboardSupport: !keyboardIssues.some(i => i.type === 'error'),
      hasFocusManagement: this.hasFocusManagement(element, instance.shadowDOM),
      hasAriaLabels: this.hasAriaLabels(element)
    };
  }

  /**
   * Check ARIA attributes for validity and completeness
   */
  private checkAriaAttributes(element: Element, instance: InstanceInfo): A11yIssue[] {
    const issues: A11yIssue[] = [];

    // Check for missing ARIA labels on interactive elements
    const role = element.getAttribute('role');
    const ariaLabel = element.getAttribute('aria-label');
    const ariaLabelledBy = element.getAttribute('aria-labelledby');
    const ariaDescribedBy = element.getAttribute('aria-describedby');

    // Interactive roles that need labels
    const interactiveRoles = ['button', 'link', 'checkbox', 'radio', 'tab', 'menuitem', 'option', 'slider', 'switch'];
    
    if (role && interactiveRoles.includes(role)) {
      if (!ariaLabel && !ariaLabelledBy && !element.textContent?.trim()) {
        issues.push({
          type: 'error',
          category: 'aria',
          message: `Element with role="${role}" has no accessible label`,
          element,
          recommendation: 'Add aria-label, aria-labelledby, or text content',
          wcagLevel: 'A'
        });
      }
    }

    // Check for invalid ARIA attributes
    const ariaAttributes = Array.from(element.attributes)
      .filter(attr => attr.name.startsWith('aria-'));

    for (const attr of ariaAttributes) {
      // Check if it's a valid ARIA attribute
      if (!this.isValidAriaAttribute(attr.name)) {
        issues.push({
          type: 'error',
          category: 'aria',
          message: `Invalid ARIA attribute: ${attr.name}`,
          element,
          recommendation: 'Remove or use a valid ARIA attribute',
          wcagLevel: 'A'
        });
      }

      // Check for empty ARIA labels
      if ((attr.name === 'aria-label' || attr.name === 'aria-labelledby') && !attr.value?.trim()) {
        issues.push({
          type: 'error',
          category: 'aria',
          message: `Empty ${attr.name} attribute`,
          element,
          recommendation: 'Provide a meaningful label or remove the attribute',
          wcagLevel: 'A'
        });
      }
    }

    // Check for ARIA hidden on interactive elements
    if (element.getAttribute('aria-hidden') === 'true') {
      const hasInteractiveChildren = element.querySelector('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (hasInteractiveChildren) {
        issues.push({
          type: 'error',
          category: 'aria',
          message: 'aria-hidden="true" on element with focusable descendants',
          element,
          recommendation: 'Remove aria-hidden or make descendants non-focusable',
          wcagLevel: 'A'
        });
      }
    }

    return issues;
  }

  /**
   * Check keyboard navigation support
   */
  private checkKeyboardSupport(element: Element): A11yIssue[] {
    const issues: A11yIssue[] = [];

    const role = element.getAttribute('role');
    const tabIndex = element.getAttribute('tabindex');
    
    // Check if interactive element is keyboard accessible
    const interactiveRoles = ['button', 'link', 'checkbox', 'radio', 'tab', 'menuitem', 'option', 'slider', 'switch'];
    
    if (role && interactiveRoles.includes(role)) {
      const isKeyboardAccessible = tabIndex !== null && tabIndex !== '-1';
      const isFocusable = element.tagName === 'BUTTON' || element.tagName === 'A' || 
                          element.tagName === 'INPUT' || element.tagName === 'SELECT' ||
                          element.tagName === 'TEXTAREA';

      if (!isKeyboardAccessible && !isFocusable) {
        issues.push({
          type: 'error',
          category: 'keyboard',
          message: `Interactive element with role="${role}" is not keyboard accessible`,
          element,
          recommendation: 'Add tabindex="0" to make element focusable',
          wcagLevel: 'A'
        });
      }
    }

    // Check for positive tabindex (anti-pattern)
    if (tabIndex && parseInt(tabIndex) > 0) {
      issues.push({
        type: 'warning',
        category: 'keyboard',
        message: 'Positive tabindex creates a confusing tab order',
        element,
        recommendation: 'Use tabindex="0" or manage focus programmatically',
        wcagLevel: 'A'
      });
    }

    return issues;
  }

  /**
   * Check focus management in shadow DOM
   */
  private checkShadowDOMFocus(element: Element, shadowDOM: any): A11yIssue[] {
    const issues: A11yIssue[] = [];

    if (!shadowDOM.hasShadowRoot) return issues;

    const shadowRoot = (element as any).shadowRoot;
    if (!shadowRoot) return issues;

    // Check for focusable elements in shadow DOM
    const focusableElements = shadowRoot.querySelectorAll(
      'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) {
      // Check if the component itself should be focusable
      const role = element.getAttribute('role');
      const interactiveRoles = ['button', 'link', 'checkbox', 'radio', 'tab', 'menuitem', 'option', 'slider', 'switch'];
      
      if (role && interactiveRoles.includes(role)) {
        issues.push({
          type: 'warning',
          category: 'focus',
          message: 'Shadow DOM contains no focusable elements',
          element,
          recommendation: 'Ensure component handles focus appropriately',
          wcagLevel: 'A'
        });
      }
    }

    // Check for delegatesFocus
    const delegatesFocus = (shadowRoot as any).delegatesFocus;
    if (!delegatesFocus && focusableElements.length > 0) {
      issues.push({
        type: 'info',
        category: 'focus',
        message: 'Shadow root does not delegate focus',
        element,
        recommendation: 'Consider using delegatesFocus: true in attachShadow()',
        wcagLevel: 'AA'
      });
    }

    return issues;
  }

  /**
   * Check color contrast issues
   */
  private checkContrastIssues(element: Element): A11yIssue[] {
    const issues: A11yIssue[] = [];

    try {
      const computed = window.getComputedStyle(element);
      const color = computed.color;
      const backgroundColor = computed.backgroundColor;

      // Parse colors
      const textColor = this.parseColor(color);
      const bgColor = this.parseColor(backgroundColor);

      if (!textColor || !bgColor) return issues;

      // Calculate contrast ratio
      const contrast = this.calculateContrastRatio(textColor, bgColor);

      // Check WCAG AA requirements
      const fontSize = parseFloat(computed.fontSize);
      const fontWeight = computed.fontWeight;
      const isLargeText = fontSize >= 18 || (fontSize >= 14 && parseInt(fontWeight) >= 700);

      const minimumContrast = isLargeText ? 3 : 4.5;

      if (contrast < minimumContrast) {
        issues.push({
          type: 'warning',
          category: 'contrast',
          message: `Insufficient color contrast: ${contrast.toFixed(2)}:1 (minimum: ${minimumContrast}:1)`,
          element,
          recommendation: 'Increase contrast between text and background colors',
          wcagLevel: 'AA'
        });
      }
    } catch (error) {
      // Silently fail if we can't calculate contrast
    }

    return issues;
  }

  /**
   * Check semantic structure
   */
  private checkSemanticStructure(element: Element, instance: InstanceInfo): A11yIssue[] {
    const issues: A11yIssue[] = [];

    // Check for heading hierarchy in shadow DOM
    if (instance.shadowDOM?.hasShadowRoot) {
      const shadowRoot = (element as any).shadowRoot;
      if (shadowRoot) {
        const headings = shadowRoot.querySelectorAll('h1, h2, h3, h4, h5, h6');
        if (headings.length > 0) {
          // Simple check: ensure h1 comes before h2, etc.
          let lastLevel = 0;
          headings.forEach((heading: Element) => {
            const level = parseInt(heading.tagName[1]);
            if (lastLevel > 0 && level > lastLevel + 1) {
              issues.push({
                type: 'warning',
                category: 'semantics',
                message: `Heading level skipped: ${heading.tagName} follows h${lastLevel}`,
                element: heading,
                recommendation: 'Use sequential heading levels for proper document structure',
                wcagLevel: 'A'
              });
            }
            lastLevel = level;
          });
        }

        // Check for images without alt text
        const images = shadowRoot.querySelectorAll('img');
        images.forEach((img: Element) => {
          if (!img.hasAttribute('alt')) {
            issues.push({
              type: 'error',
              category: 'semantics',
              message: 'Image missing alt attribute',
              element: img,
              recommendation: 'Add alt="" for decorative images or descriptive alt text',
              wcagLevel: 'A'
            });
          }
        });
      }
    }

    return issues;
  }

  /**
   * Calculate accessibility score (0-100)
   */
  private calculateA11yScore(issues: A11yIssue[]): number {
    let score = 100;

    issues.forEach(issue => {
      if (issue.type === 'error') {
        score -= 15;
      } else if (issue.type === 'warning') {
        score -= 8;
      } else if (issue.type === 'info') {
        score -= 3;
      }
    });

    return Math.max(0, score);
  }

  /**
   * Check if element has focus management
   */
  private hasFocusManagement(element: Element, shadowDOM: any): boolean {
    if (element.hasAttribute('tabindex')) return true;
    
    if (shadowDOM?.hasShadowRoot) {
      const shadowRoot = (element as any).shadowRoot;
      if (!shadowRoot) return false;
      
      const focusable = shadowRoot.querySelector('button, a[href], input, select, textarea, [tabindex]');
      return !!focusable;
    }

    return false;
  }

  /**
   * Check if element has ARIA labels
   */
  private hasAriaLabels(element: Element): boolean {
    return !!(
      element.getAttribute('aria-label') ||
      element.getAttribute('aria-labelledby') ||
      element.getAttribute('role')
    );
  }

  /**
   * Validate ARIA attribute name
   */
  private isValidAriaAttribute(name: string): boolean {
    const validAriaAttributes = [
      'aria-activedescendant', 'aria-atomic', 'aria-autocomplete', 'aria-busy',
      'aria-checked', 'aria-colcount', 'aria-colindex', 'aria-colspan',
      'aria-controls', 'aria-current', 'aria-describedby', 'aria-details',
      'aria-disabled', 'aria-dropeffect', 'aria-errormessage', 'aria-expanded',
      'aria-flowto', 'aria-grabbed', 'aria-haspopup', 'aria-hidden',
      'aria-invalid', 'aria-keyshortcuts', 'aria-label', 'aria-labelledby',
      'aria-level', 'aria-live', 'aria-modal', 'aria-multiline',
      'aria-multiselectable', 'aria-orientation', 'aria-owns', 'aria-placeholder',
      'aria-posinset', 'aria-pressed', 'aria-readonly', 'aria-relevant',
      'aria-required', 'aria-roledescription', 'aria-rowcount', 'aria-rowindex',
      'aria-rowspan', 'aria-selected', 'aria-setsize', 'aria-sort',
      'aria-valuemax', 'aria-valuemin', 'aria-valuenow', 'aria-valuetext'
    ];

    return validAriaAttributes.includes(name);
  }

  /**
   * Parse CSS color to RGB
   */
  private parseColor(color: string): { r: number; g: number; b: number; a: number } | null {
    // Handle rgb/rgba
    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (rgbMatch) {
      return {
        r: parseInt(rgbMatch[1]),
        g: parseInt(rgbMatch[2]),
        b: parseInt(rgbMatch[3]),
        a: rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1
      };
    }

    return null;
  }

  /**
   * Calculate relative luminance
   */
  private getRelativeLuminance(color: { r: number; g: number; b: number }): number {
    const rsRGB = color.r / 255;
    const gsRGB = color.g / 255;
    const bsRGB = color.b / 255;

    const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  /**
   * Calculate contrast ratio between two colors
   */
  private calculateContrastRatio(color1: { r: number; g: number; b: number }, color2: { r: number; g: number; b: number }): number {
    const l1 = this.getRelativeLuminance(color1);
    const l2 = this.getRelativeLuminance(color2);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  }
}
