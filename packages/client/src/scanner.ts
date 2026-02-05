// Component scanner for Web Component Dev Tools

import type { InstanceInfo, ShadowDOMInfo, ShadowDOMNode, SlotAssignment } from './types';
import { getCSSVariables } from './css-variable-tracker';
import type { RenderTracker } from './render-tracker';

export function scanWebComponents(renderTracker?: RenderTracker): InstanceInfo[] {
  const instances: InstanceInfo[] = [];

  // Use TreeWalker for efficient DOM traversal - only visits element nodes
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (node) => {
      // Filter for custom elements (contains hyphen)
      return (node as Element).nodeName.includes('-')
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_SKIP;
    },
  });

  let node: Node | null;
  while ((node = walker.nextNode())) {
    const element = node as Element;
    const tagName = element.nodeName.toLowerCase();

    const instanceInfo: InstanceInfo = {
      element,
      tagName,
      attributes: new Map<string, string | null>(),
      properties: new Map<string, unknown>(),
      methods: [],
      slots: new Map<string, boolean>(),
      shadowDOM: null,
      nestedComponents: [],
      parentComponent: null,
      isInShadowDOM: false, // Root components are not in shadow DOM
    };

    // Collect attributes with their values
    const attrs = element.attributes;
    for (let i = 0; i < attrs.length; i++) {
      const attrName = attrs[i].name;
      const attrValue = attrs[i].value;
      instanceInfo.attributes.set(attrName, attrValue);
    }

    // Collect properties (from the element instance)
    const elementAsAny = element as any;

    // Get properties from the element's prototype chain
    const proto = Object.getPrototypeOf(element);
    if (proto && proto !== HTMLElement.prototype) {
      const descriptors = Object.getOwnPropertyDescriptors(proto);

      for (const propName in descriptors) {
        const descriptor = descriptors[propName];

        // Skip private properties (starting with _), constructor, and standard HTMLElement methods
        if (
          propName.startsWith('_') ||
          propName === 'constructor' ||
          propName in HTMLElement.prototype
        ) {
          continue;
        }

        // If it has a getter, it's a property
        if (descriptor.get) {
          try {
            const value = elementAsAny[propName];
            instanceInfo.properties.set(propName, value);
          } catch {
            // Skip properties that throw errors
          }
        }

        // If it's a function and not a property accessor, it's a method
        if (typeof descriptor.value === 'function' && !descriptor.get && !descriptor.set) {
          // Exclude Lit lifecycle methods from public methods
          const litLifecycleMethods = [
            'connectedCallback',
            'disconnectedCallback',
            'attributeChangedCallback',
            'adoptedCallback',
            'shouldUpdate',
            'willUpdate',
            'update',
            'render',
            'firstUpdated',
            'updated',
            'createRenderRoot',
            'performUpdate',
            'scheduleUpdate',
            'requestUpdate',
            'getUpdateComplete',
          ];

          // Only include public methods (exclude private methods starting with _ and lifecycle methods)
          if (!propName.startsWith('_') && !litLifecycleMethods.includes(propName)) {
            instanceInfo.methods.push(propName);
          }
        }
      }
    }

    // Collect slots from shadow DOM
    if (element.shadowRoot) {
      const slots = element.shadowRoot.querySelectorAll('slot');
      slots.forEach((slot) => {
        const slotName = slot.getAttribute('name') || 'default';
        const assignedNodes = slot.assignedNodes();
        const hasContent = assignedNodes.length > 0;
        instanceInfo.slots.set(slotName, hasContent);
      });

      // Collect shadow DOM information
      instanceInfo.shadowDOM = scanShadowDOM(element.shadowRoot);

      // Scan for nested web components inside the shadow DOM
      instanceInfo.nestedComponents = scanNestedWebComponents(
        element.shadowRoot,
        element,
        renderTracker,
      );
    }

    // Collect CSS variables affecting this component
    try {
      const cssVarInfo = getCSSVariables(element);
      instanceInfo.cssVariables = cssVarInfo.variables;
    } catch {
      // Handle errors gracefully
      instanceInfo.cssVariables = [];
    }

    // Get render count if tracking is enabled
    if (renderTracker && renderTracker.isEnabled()) {
      instanceInfo.renderCount = renderTracker.getRenderCount(element);
    }

    instances.push(instanceInfo);

    // Also add all nested components to the flat list
    if (instanceInfo.nestedComponents && instanceInfo.nestedComponents.length > 0) {
      flattenNestedComponents(instanceInfo.nestedComponents, instances);
    }
  }

  return instances;
}

/**
 * Recursively flatten nested components and add them to the instances array
 */
function flattenNestedComponents(
  nestedComponents: InstanceInfo[],
  instances: InstanceInfo[],
): void {
  for (const nested of nestedComponents) {
    instances.push(nested);

    // Recursively flatten deeper nesting levels
    if (nested.nestedComponents && nested.nestedComponents.length > 0) {
      flattenNestedComponents(nested.nestedComponents, instances);
    }
  }
}

/**
 * Scan for web components nested inside a shadow root
 */
function scanNestedWebComponents(
  shadowRoot: ShadowRoot,
  parentElement: Element,
  renderTracker?: RenderTracker,
): InstanceInfo[] {
  const nestedComponents: InstanceInfo[] = [];

  // Use TreeWalker to find custom elements inside shadow DOM
  const walker = document.createTreeWalker(shadowRoot, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (node) => {
      // Filter for custom elements (contains hyphen)
      return (node as Element).nodeName.includes('-')
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_SKIP;
    },
  });

  let node: Node | null;
  while ((node = walker.nextNode())) {
    const element = node as Element;
    const tagName = element.nodeName.toLowerCase();

    const instanceInfo: InstanceInfo = {
      element,
      tagName,
      attributes: new Map<string, string | null>(),
      properties: new Map<string, unknown>(),
      methods: [],
      slots: new Map<string, boolean>(),
      shadowDOM: null,
      nestedComponents: [],
      parentComponent: parentElement,
      isInShadowDOM: true, // This component is inside a shadow DOM
    };

    // Collect attributes with their values
    const attrs = element.attributes;
    for (let i = 0; i < attrs.length; i++) {
      const attrName = attrs[i].name;
      const attrValue = attrs[i].value;
      instanceInfo.attributes.set(attrName, attrValue);
    }

    // Collect properties (from the element instance)
    const elementAsAny = element as any;

    // Get properties from the element's prototype chain
    const proto = Object.getPrototypeOf(element);
    if (proto && proto !== HTMLElement.prototype) {
      const descriptors = Object.getOwnPropertyDescriptors(proto);

      for (const propName in descriptors) {
        const descriptor = descriptors[propName];

        // Skip private properties (starting with _), constructor, and standard HTMLElement methods
        if (
          propName.startsWith('_') ||
          propName === 'constructor' ||
          propName in HTMLElement.prototype
        ) {
          continue;
        }

        // If it has a getter, it's a property
        if (descriptor.get) {
          try {
            const value = elementAsAny[propName];
            instanceInfo.properties.set(propName, value);
          } catch {
            // Skip properties that throw errors
          }
        }

        // If it's a function and not a property accessor, it's a method
        if (typeof descriptor.value === 'function' && !descriptor.get && !descriptor.set) {
          // Exclude Lit lifecycle methods from public methods
          const litLifecycleMethods = [
            'connectedCallback',
            'disconnectedCallback',
            'attributeChangedCallback',
            'adoptedCallback',
            'shouldUpdate',
            'willUpdate',
            'update',
            'render',
            'firstUpdated',
            'updated',
            'createRenderRoot',
            'performUpdate',
            'scheduleUpdate',
            'requestUpdate',
            'getUpdateComplete',
          ];

          // Only include public methods (exclude private methods starting with _ and lifecycle methods)
          if (!propName.startsWith('_') && !litLifecycleMethods.includes(propName)) {
            instanceInfo.methods.push(propName);
          }
        }
      }
    }

    // Collect slots from shadow DOM
    if (element.shadowRoot) {
      const slots = element.shadowRoot.querySelectorAll('slot');
      slots.forEach((slot) => {
        const slotName = slot.getAttribute('name') || 'default';
        const assignedNodes = slot.assignedNodes();
        const hasContent = assignedNodes.length > 0;
        instanceInfo.slots.set(slotName, hasContent);
      });

      // Collect shadow DOM information
      instanceInfo.shadowDOM = scanShadowDOM(element.shadowRoot);

      // Recursively scan for nested components
      instanceInfo.nestedComponents = scanNestedWebComponents(
        element.shadowRoot,
        element,
        renderTracker,
      );
    }

    // Collect CSS variables affecting this component
    try {
      const cssVarInfo = getCSSVariables(element);
      instanceInfo.cssVariables = cssVarInfo.variables;
    } catch {
      // Handle errors gracefully
      instanceInfo.cssVariables = [];
    }

    // Get render count if tracking is enabled
    if (renderTracker && renderTracker.isEnabled()) {
      instanceInfo.renderCount = renderTracker.getRenderCount(element);
    }

    nestedComponents.push(instanceInfo);
  }

  return nestedComponents;
}

/**
 * Scan shadow DOM and extract detailed information
 */
function scanShadowDOM(shadowRoot: ShadowRoot): ShadowDOMInfo {
  const shadowInfo: ShadowDOMInfo = {
    hasShadowRoot: true,
    mode: shadowRoot.mode,
    adoptedStyleSheets: shadowRoot.adoptedStyleSheets?.length || 0,
    styleSheets: Array.from(shadowRoot.adoptedStyleSheets || []),
    customProperties: new Map<string, string>(),
    slotAssignments: new Map<string, SlotAssignment>(),
    children: [],
  };

  // Extract CSS custom properties from adopted stylesheets
  try {
    shadowRoot.adoptedStyleSheets?.forEach((sheet) => {
      try {
        Array.from(sheet.cssRules).forEach((rule) => {
          if (rule instanceof CSSStyleRule) {
            const style = rule.style;
            for (let i = 0; i < style.length; i++) {
              const prop = style[i];
              if (prop.startsWith('--')) {
                const value = style.getPropertyValue(prop);
                shadowInfo.customProperties.set(prop, value);
              }
            }
          }
        });
      } catch {
        // Cross-origin or other security errors
      }
    });
  } catch {
    // Handle errors gracefully
  }

  // Also check inline styles and style elements for custom properties
  const styleElements = shadowRoot.querySelectorAll('style');
  styleElements.forEach((styleEl) => {
    try {
      const sheet = styleEl.sheet;
      if (sheet) {
        Array.from(sheet.cssRules).forEach((rule) => {
          if (rule instanceof CSSStyleRule) {
            const style = rule.style;
            for (let i = 0; i < style.length; i++) {
              const prop = style[i];
              if (prop.startsWith('--')) {
                const value = style.getPropertyValue(prop);
                shadowInfo.customProperties.set(prop, value);
              }
            }
          }
        });
      }
    } catch {
      // Handle errors gracefully
    }
  });

  // Scan slot assignments
  const slots = shadowRoot.querySelectorAll('slot');
  slots.forEach((slot) => {
    const slotName = slot.getAttribute('name') || 'default';
    const assignedNodes = slot.assignedNodes();
    const assignedElements = slot.assignedElements();

    const assignment: SlotAssignment = {
      slotName,
      slotElement: slot,
      assignedNodes: Array.from(assignedNodes),
      assignedElements: Array.from(assignedElements),
      hasContent: assignedNodes.length > 0,
    };

    shadowInfo.slotAssignments.set(slotName, assignment);
  });

  // Build tree of shadow DOM children
  shadowInfo.children = buildShadowDOMTree(shadowRoot.childNodes);

  return shadowInfo;
}

/**
 * Recursively build a tree representation of shadow DOM nodes
 */
function buildShadowDOMTree(nodes: NodeListOf<ChildNode> | Node[]): ShadowDOMNode[] {
  const tree: ShadowDOMNode[] = [];

  for (const node of Array.from(nodes)) {
    const shadowNode: ShadowDOMNode = {
      nodeType: node.nodeType,
      nodeName: node.nodeName,
      nodeValue: node.nodeValue,
      textContent: node.nodeType === Node.TEXT_NODE ? node.textContent : null,
      attributes: new Map(),
      isSlot: false,
      children: [],
    };

    // For element nodes, extract attributes
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const attrs = element.attributes;

      for (let i = 0; i < attrs.length; i++) {
        const attr = attrs[i];
        shadowNode.attributes.set(attr.name, attr.value);
      }

      // Check if it's a slot element
      if (element.nodeName.toLowerCase() === 'slot') {
        shadowNode.isSlot = true;
        shadowNode.slotName = element.getAttribute('name') || 'default';
      }

      // Recursively build children
      if (element.childNodes.length > 0) {
        shadowNode.children = buildShadowDOMTree(element.childNodes);
      }
    }

    tree.push(shadowNode);
  }

  return tree;
}
