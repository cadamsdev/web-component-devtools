// Component scanner for Web Component Dev Tools

import type { InstanceInfo } from './types';

export function scanWebComponents(): InstanceInfo[] {
  const instances: InstanceInfo[] = [];

  // Use TreeWalker for efficient DOM traversal - only visits element nodes
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_ELEMENT,
    {
      acceptNode: (node) => {
        // Filter for custom elements (contains hyphen)
        return (node as Element).nodeName.includes('-')
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_SKIP;
      },
    }
  );

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
        if (propName.startsWith('_') || 
            propName === 'constructor' ||
            propName in HTMLElement.prototype) {
          continue;
        }

        // If it has a getter, it's a property
        if (descriptor.get) {
          try {
            const value = elementAsAny[propName];
            instanceInfo.properties.set(propName, value);
          } catch (e) {
            // Skip properties that throw errors
          }
        }
        
        // If it's a function and not a property accessor, it's a method
        if (typeof descriptor.value === 'function' && !descriptor.get && !descriptor.set) {
          instanceInfo.methods.push(propName);
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
    }

    instances.push(instanceInfo);
  }

  return instances;
}
