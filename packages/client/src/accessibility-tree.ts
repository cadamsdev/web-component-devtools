// Accessibility Tree Viewer for Web Component Dev Tools
// Shows the accessibility tree and ARIA properties

import type { InstanceInfo } from './types';

export interface A11yTreeNode {
  element: Element;
  role: string | null;
  name: string | null;
  description: string | null;
  level?: number;
  children: A11yTreeNode[];
  ariaProperties: Map<string, string>;
  ariaStates: Map<string, string>;
  isFocusable: boolean;
  tabIndex: number | null;
  isHidden: boolean;
}

export class AccessibilityTree {
  /**
   * Build accessibility tree for a component
   */
  buildTree(instance: InstanceInfo): A11yTreeNode {
    return this.buildNodeTree(instance.element, instance.shadowDOM?.hasShadowRoot || false);
  }

  /**
   * Build tree node recursively
   */
  private buildNodeTree(element: Element, hasShadowRoot: boolean): A11yTreeNode {
    const node: A11yTreeNode = {
      element,
      role: this.getRole(element),
      name: this.getAccessibleName(element),
      description: this.getAccessibleDescription(element),
      children: [],
      ariaProperties: this.getAriaProperties(element),
      ariaStates: this.getAriaStates(element),
      isFocusable: this.isFocusable(element),
      tabIndex: this.getTabIndex(element),
      isHidden: this.isHidden(element),
    };

    // Add level if it's a heading
    if (node.role === 'heading' || /^H[1-6]$/.test(element.tagName)) {
      const ariaLevel = element.getAttribute('aria-level');
      if (ariaLevel) {
        node.level = parseInt(ariaLevel);
      } else if (/^H[1-6]$/.test(element.tagName)) {
        node.level = parseInt(element.tagName[1]);
      }
    }

    // Build children from shadow DOM if available
    if (hasShadowRoot) {
      const shadowRoot = (element as any).shadowRoot;
      if (shadowRoot) {
        const children = Array.from(shadowRoot.children);
        node.children = children
          .map((child) => this.buildNodeTree(child as Element, false))
          .filter((child) => !child.isHidden || child.children.length > 0);
      }
    }

    // Also include light DOM children that might be slotted
    const lightChildren = Array.from(element.children);
    const lightChildNodes = lightChildren
      .map((child) => this.buildNodeTree(child as Element, false))
      .filter((child) => !child.isHidden || child.children.length > 0);

    node.children.push(...lightChildNodes);

    return node;
  }

  /**
   * Get the computed role of an element
   */
  private getRole(element: Element): string | null {
    // Explicit role
    const explicitRole = element.getAttribute('role');
    if (explicitRole) return explicitRole;

    // Implicit roles based on tag name
    const implicitRoles: Record<string, string> = {
      A: 'link',
      ARTICLE: 'article',
      ASIDE: 'complementary',
      BUTTON: 'button',
      DIALOG: 'dialog',
      FOOTER: 'contentinfo',
      FORM: 'form',
      H1: 'heading',
      H2: 'heading',
      H3: 'heading',
      H4: 'heading',
      H5: 'heading',
      H6: 'heading',
      HEADER: 'banner',
      IMG: 'img',
      INPUT: this.getInputRole(element as HTMLInputElement),
      LI: 'listitem',
      MAIN: 'main',
      NAV: 'navigation',
      OL: 'list',
      SECTION: 'region',
      SELECT: 'combobox',
      TABLE: 'table',
      TEXTAREA: 'textbox',
      UL: 'list',
    };

    return implicitRoles[element.tagName] || null;
  }

  /**
   * Get role for input elements based on type
   */
  private getInputRole(input: HTMLInputElement): string {
    const type = input.type?.toLowerCase() || 'text';
    const roleMap: Record<string, string> = {
      button: 'button',
      checkbox: 'checkbox',
      radio: 'radio',
      range: 'slider',
      search: 'searchbox',
      email: 'textbox',
      tel: 'textbox',
      url: 'textbox',
      text: 'textbox',
      number: 'spinbutton',
    };
    return roleMap[type] || 'textbox';
  }

  /**
   * Get accessible name for an element
   */
  private getAccessibleName(element: Element): string | null {
    // 1. aria-labelledby
    const labelledBy = element.getAttribute('aria-labelledby');
    if (labelledBy) {
      const ids = labelledBy.split(/\s+/);
      const labels = ids
        .map((id) => document.getElementById(id)?.textContent?.trim())
        .filter(Boolean);
      if (labels.length > 0) return labels.join(' ');
    }

    // 2. aria-label
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) return ariaLabel;

    // 3. alt attribute (for images)
    if (element.tagName === 'IMG') {
      const alt = element.getAttribute('alt');
      if (alt !== null) return alt;
    }

    // 4. label element (for inputs)
    if (
      element.tagName === 'INPUT' ||
      element.tagName === 'SELECT' ||
      element.tagName === 'TEXTAREA'
    ) {
      const id = element.getAttribute('id');
      if (id) {
        const label = document.querySelector(`label[for="${id}"]`);
        if (label?.textContent) return label.textContent.trim();
      }

      // Check if wrapped in label
      const parentLabel = element.closest('label');
      if (parentLabel?.textContent) return parentLabel.textContent.trim();
    }

    // 5. Text content (for buttons, links, etc.)
    const role = this.getRole(element);
    if (role && ['button', 'link', 'heading', 'listitem'].includes(role)) {
      const text = element.textContent?.trim();
      if (text) return text;
    }

    // 6. title attribute
    const title = element.getAttribute('title');
    if (title) return title;

    return null;
  }

  /**
   * Get accessible description for an element
   */
  private getAccessibleDescription(element: Element): string | null {
    // 1. aria-describedby
    const describedBy = element.getAttribute('aria-describedby');
    if (describedBy) {
      const ids = describedBy.split(/\s+/);
      const descriptions = ids
        .map((id) => document.getElementById(id)?.textContent?.trim())
        .filter(Boolean);
      if (descriptions.length > 0) return descriptions.join(' ');
    }

    // 2. aria-description
    const ariaDescription = element.getAttribute('aria-description');
    if (ariaDescription) return ariaDescription;

    // 3. title (if not used for name)
    if (!this.getAccessibleName(element)) {
      const title = element.getAttribute('title');
      if (title) return title;
    }

    return null;
  }

  /**
   * Get all ARIA properties (not states)
   */
  private getAriaProperties(element: Element): Map<string, string> {
    const properties = new Map<string, string>();

    const propertyNames = [
      'aria-atomic',
      'aria-autocomplete',
      'aria-colcount',
      'aria-colindex',
      'aria-colspan',
      'aria-controls',
      'aria-describedby',
      'aria-details',
      'aria-dropeffect',
      'aria-errormessage',
      'aria-flowto',
      'aria-haspopup',
      'aria-keyshortcuts',
      'aria-label',
      'aria-labelledby',
      'aria-level',
      'aria-live',
      'aria-multiline',
      'aria-multiselectable',
      'aria-orientation',
      'aria-owns',
      'aria-placeholder',
      'aria-posinset',
      'aria-readonly',
      'aria-relevant',
      'aria-required',
      'aria-roledescription',
      'aria-rowcount',
      'aria-rowindex',
      'aria-rowspan',
      'aria-setsize',
      'aria-sort',
      'aria-valuemax',
      'aria-valuemin',
      'aria-valuenow',
      'aria-valuetext',
    ];

    for (const name of propertyNames) {
      const value = element.getAttribute(name);
      if (value !== null) {
        properties.set(name, value);
      }
    }

    return properties;
  }

  /**
   * Get all ARIA states
   */
  private getAriaStates(element: Element): Map<string, string> {
    const states = new Map<string, string>();

    const stateNames = [
      'aria-busy',
      'aria-checked',
      'aria-current',
      'aria-disabled',
      'aria-expanded',
      'aria-grabbed',
      'aria-hidden',
      'aria-invalid',
      'aria-modal',
      'aria-pressed',
      'aria-selected',
    ];

    for (const name of stateNames) {
      const value = element.getAttribute(name);
      if (value !== null) {
        states.set(name, value);
      }
    }

    return states;
  }

  /**
   * Check if element is focusable
   */
  private isFocusable(element: Element): boolean {
    // Check if hidden
    if (this.isHidden(element)) return false;

    // Disabled elements are not focusable
    if ((element as HTMLElement).hasAttribute('disabled')) return false;
    if (element.getAttribute('aria-disabled') === 'true') return false;

    // Check tabindex
    const tabIndex = element.getAttribute('tabindex');
    if (tabIndex !== null) {
      return parseInt(tabIndex) >= 0;
    }

    // Inherently focusable elements
    const focusableTags = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'DETAILS', 'SUMMARY'];
    if (focusableTags.includes(element.tagName)) {
      // Links need href to be focusable
      if (element.tagName === 'A') {
        return element.hasAttribute('href');
      }
      return true;
    }

    return false;
  }

  /**
   * Get tabindex value
   */
  private getTabIndex(element: Element): number | null {
    const tabIndex = element.getAttribute('tabindex');
    if (tabIndex !== null) {
      return parseInt(tabIndex);
    }
    return null;
  }

  /**
   * Check if element is hidden from accessibility tree
   */
  private isHidden(element: Element): boolean {
    // aria-hidden
    if (element.getAttribute('aria-hidden') === 'true') return true;

    // CSS display: none or visibility: hidden
    const computed = window.getComputedStyle(element);
    if (computed.display === 'none' || computed.visibility === 'hidden') return true;

    // hidden attribute
    if (element.hasAttribute('hidden')) return true;

    return false;
  }

  /**
   * Get a flat list of all nodes in the tree
   */
  flattenTree(node: A11yTreeNode, depth: number = 0): Array<{ node: A11yTreeNode; depth: number }> {
    const result: Array<{ node: A11yTreeNode; depth: number }> = [{ node, depth }];

    for (const child of node.children) {
      result.push(...this.flattenTree(child, depth + 1));
    }

    return result;
  }

  /**
   * Simulate screen reader output for a node
   */
  getScreenReaderText(node: A11yTreeNode): string {
    const parts: string[] = [];

    // Role announcement
    if (node.role) {
      parts.push(node.role);
    }

    // Name
    if (node.name) {
      parts.push(node.name);
    }

    // Level (for headings)
    if (node.level) {
      parts.push(`level ${node.level}`);
    }

    // States
    if (node.ariaStates.has('aria-expanded')) {
      parts.push(node.ariaStates.get('aria-expanded') === 'true' ? 'expanded' : 'collapsed');
    }
    if (node.ariaStates.has('aria-checked')) {
      const checked = node.ariaStates.get('aria-checked');
      if (checked === 'true') parts.push('checked');
      else if (checked === 'false') parts.push('not checked');
      else if (checked === 'mixed') parts.push('partially checked');
    }
    if (node.ariaStates.has('aria-selected')) {
      parts.push(node.ariaStates.get('aria-selected') === 'true' ? 'selected' : 'not selected');
    }
    if (node.ariaStates.has('aria-disabled') && node.ariaStates.get('aria-disabled') === 'true') {
      parts.push('disabled');
    }

    // Description
    if (node.description) {
      parts.push(node.description);
    }

    // Focusable
    if (node.isFocusable) {
      parts.push('focusable');
    }

    return parts.join(', ');
  }
}
