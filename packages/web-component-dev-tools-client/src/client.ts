// Web Component Dev Tools Client Script
// This script is injected into the page to provide debugging tools for web components

interface AttributeInfo {
  name: string;
  value: string | null;
}

interface PropertyInfo {
  name: string;
  value: unknown;
  type: string;
}

interface MethodInfo {
  name: string;
}

interface SlotInfo {
  name: string;
  hasContent: boolean;
}

interface ComponentInfo {
  name: string;
  count: number;
  instances: Element[];
  attributes: Map<string, Set<string | null>>;
  properties: Map<string, Set<unknown>>;
  methods: Set<string>;
  slots: Map<string, boolean>;
}

interface DevToolsConfig {
  position: string;
}

export function initDevTools(config: DevToolsConfig) {
  const { position } = config;

  injectStyles(position);

  const button = createButton();
  const panel = createPanel();

  document.body.appendChild(button);
  document.body.appendChild(panel);

  setupEventListeners(button, panel);

  watchForChanges(panel);
}

function injectStyles(position: string): void {
  const css = [
    '#wc-devtools-btn {',
    '  position: fixed;',
    `  ${getPositionStyles(position)}`,
    '  width: 50px;',
    '  height: 50px;',
    '  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);',
    '  border: none;',
    '  border-radius: 50%;',
    '  cursor: pointer;',
    '  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);',
    '  z-index: 999999;',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  transition: all 0.3s ease;',
    '  font-size: 24px;',
    '  color: white;',
    '}',
    '',
    '#wc-devtools-btn:hover {',
    '  transform: scale(1.1);',
    '  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);',
    '}',
    '',
    '#wc-devtools-panel {',
    '  position: fixed;',
    `  ${getPositionStyles(position, true)}`,
    '  width: 500px;',
    '  max-height: 700px;',
    '  background: white;',
    '  border-radius: 12px;',
    '  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);',
    '  z-index: 999998;',
    '  display: none;',
    '  flex-direction: column;',
    '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;',
    '  overflow: hidden;',
    '}',
    '',
    '#wc-devtools-panel.visible {',
    '  display: flex;',
    '}',
    '',
    '.wc-devtools-header {',
    '  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);',
    '  color: white;',
    '  padding: 16px;',
    '  font-weight: 600;',
    '  font-size: 16px;',
    '  display: flex;',
    '  justify-content: space-between;',
    '  align-items: center;',
    '}',
    '',
    '.wc-devtools-close {',
    '  background: none;',
    '  border: none;',
    '  color: white;',
    '  font-size: 24px;',
    '  cursor: pointer;',
    '  padding: 0;',
    '  width: 30px;',
    '  height: 30px;',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  border-radius: 4px;',
    '  transition: background 0.2s;',
    '}',
    '',
    '.wc-devtools-close:hover {',
    '  background: rgba(255, 255, 255, 0.2);',
    '}',
    '',
    '.wc-devtools-content {',
    '  padding: 16px;',
    '  overflow-y: auto;',
    '  flex: 1;',
    '}',
    '',
    '.wc-component {',
    '  background: #f7fafc;',
    '  border: 1px solid #e2e8f0;',
    '  border-radius: 8px;',
    '  padding: 12px;',
    '  margin-bottom: 12px;',
    '}',
    '',
    '.wc-component-name {',
    '  font-weight: 600;',
    '  color: #2d3748;',
    '  margin-bottom: 8px;',
    '  font-size: 14px;',
    '}',
    '',
    '.wc-component-count {',
    '  color: #718096;',
    '  font-size: 12px;',
    '  margin-bottom: 8px;',
    '}',
    '',
    '.wc-section {',
    '  margin-top: 12px;',
    '  padding-top: 8px;',
    '  border-top: 1px solid #e2e8f0;',
    '}',
    '',
    '.wc-section-title {',
    '  font-weight: 600;',
    '  font-size: 12px;',
    '  color: #4a5568;',
    '  margin-bottom: 6px;',
    '  text-transform: uppercase;',
    '  letter-spacing: 0.5px;',
    '}',
    '',
    '.wc-component-attributes {',
    '  font-size: 12px;',
    '  color: #4a5568;',
    '}',
    '',
    '.wc-attribute {',
    '  background: white;',
    '  padding: 4px 8px;',
    '  border-radius: 4px;',
    '  margin: 4px 4px 4px 0;',
    '  display: inline-block;',
    '  border: 1px solid #e2e8f0;',
    '}',
    '',
    '.wc-attribute-name {',
    '  color: #805ad5;',
    '  font-weight: 500;',
    '}',
    '',
    '.wc-attribute-value {',
    '  color: #2d3748;',
    '}',
    '',
    '.wc-property {',
    '  background: white;',
    '  padding: 6px 10px;',
    '  border-radius: 4px;',
    '  margin: 4px 0;',
    '  border: 1px solid #e2e8f0;',
    '  font-size: 12px;',
    '}',
    '',
    '.wc-property-name {',
    '  color: #3182ce;',
    '  font-weight: 500;',
    '}',
    '',
    '.wc-property-value {',
    '  color: #2d3748;',
    '  font-family: "Monaco", "Courier New", monospace;',
    '}',
    '',
    '.wc-property-type {',
    '  color: #718096;',
    '  font-style: italic;',
    '  font-size: 11px;',
    '}',
    '',
    '.wc-method {',
    '  background: white;',
    '  padding: 4px 8px;',
    '  border-radius: 4px;',
    '  margin: 4px 4px 4px 0;',
    '  display: inline-block;',
    '  border: 1px solid #e2e8f0;',
    '  font-size: 12px;',
    '  font-family: "Monaco", "Courier New", monospace;',
    '}',
    '',
    '.wc-method-name {',
    '  color: #d69e2e;',
    '  font-weight: 500;',
    '}',
    '',
    '.wc-slot {',
    '  background: white;',
    '  padding: 4px 8px;',
    '  border-radius: 4px;',
    '  margin: 4px 4px 4px 0;',
    '  display: inline-block;',
    '  border: 1px solid #e2e8f0;',
    '  font-size: 12px;',
    '}',
    '',
    '.wc-slot-name {',
    '  color: #38a169;',
    '  font-weight: 500;',
    '}',
    '',
    '.wc-slot-status {',
    '  color: #718096;',
    '  font-size: 11px;',
    '}',
    '',
    '.wc-slot.has-content {',
    '  border-color: #38a169;',
    '  background: #f0fff4;',
    '}',
    '',
    '.wc-no-components {',
    '  text-align: center;',
    '  color: #718096;',
    '  padding: 32px;',
    '}',
    '',
    '.wc-stats {',
    '  background: #edf2f7;',
    '  padding: 12px;',
    '  border-radius: 8px;',
    '  margin-bottom: 16px;',
    '  font-size: 14px;',
    '  color: #2d3748;',
    '}',
  ].join('\n');

  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);
}

function createButton(): HTMLButtonElement {
  const button = document.createElement('button');
  button.id = 'wc-devtools-btn';
  button.textContent = '⚡';
  button.title = 'Web Component Dev Tools';
  return button;
}

function createPanel(): HTMLDivElement {
  const panel = document.createElement('div');
  panel.id = 'wc-devtools-panel';

  const header = document.createElement('div');
  header.className = 'wc-devtools-header';

  const title = document.createElement('span');
  title.textContent = 'Web Components';
  header.appendChild(title);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'wc-devtools-close';
  closeBtn.textContent = '×';
  header.appendChild(closeBtn);

  const content = document.createElement('div');
  content.className = 'wc-devtools-content';
  content.id = 'wc-devtools-content';
  content.textContent = 'Loading...';

  panel.appendChild(header);
  panel.appendChild(content);

  return panel;
}

function setupEventListeners(button: HTMLButtonElement, panel: HTMLDivElement): void {
  button.addEventListener('click', () => {
    const isVisible = panel.classList.toggle('visible');
    if (isVisible) {
      updateComponentList();
    }
  });

  const closeBtn = panel.querySelector('.wc-devtools-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      panel.classList.remove('visible');
    });
  }
}

function scanWebComponents(): Map<string, ComponentInfo> {
    const components = new Map<string, ComponentInfo>();

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

      if (!components.has(tagName)) {
        components.set(tagName, {
          name: tagName,
          count: 0,
          instances: [],
          attributes: new Map<string, Set<string | null>>(),
          properties: new Map<string, Set<unknown>>(),
          methods: new Set<string>(),
          slots: new Map<string, boolean>(),
        });
      }

      const component = components.get(tagName)!;
      component.count++;
      component.instances.push(element);

      // Collect attributes with their values
      const attrs = element.attributes;
      for (let i = 0; i < attrs.length; i++) {
        const attrName = attrs[i].name;
        const attrValue = attrs[i].value;
        
        if (!component.attributes.has(attrName)) {
          component.attributes.set(attrName, new Set());
        }
        component.attributes.get(attrName)!.add(attrValue);
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
              if (!component.properties.has(propName)) {
                component.properties.set(propName, new Set());
              }
              component.properties.get(propName)!.add(value);
            } catch (e) {
              // Skip properties that throw errors
            }
          }
          
          // If it's a function and not a property accessor, it's a method
          if (typeof descriptor.value === 'function' && !descriptor.get && !descriptor.set) {
            component.methods.add(propName);
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
          
          // Track if any instance has content in this slot
          if (component.slots.has(slotName)) {
            component.slots.set(slotName, component.slots.get(slotName)! || hasContent);
          } else {
            component.slots.set(slotName, hasContent);
          }
        });
      }
    }

  return components;
}

function updateComponentList(): void {
  const content = document.getElementById('wc-devtools-content');
  if (!content) return;

  const components = scanWebComponents();

  content.innerHTML = '';

  if (components.size === 0) {
    const noComponents = document.createElement('div');
    noComponents.className = 'wc-no-components';
    noComponents.textContent = 'No web components found on this page.';
    content.appendChild(noComponents);
    return;
  }

  const totalInstances = Array.from(components.values()).reduce(
    (sum, c) => sum + c.count,
    0
  );

  const stats = createStatsElement(components.size, totalInstances);
  content.appendChild(stats);

  components.forEach((component) => {
    const componentEl = createComponentElement(component);
    content.appendChild(componentEl);
  });
}

function createStatsElement(uniqueCount: number, totalCount: number): HTMLDivElement {
  const stats = document.createElement('div');
  stats.className = 'wc-stats';

  const uniqueLabel = document.createElement('strong');
  uniqueLabel.textContent = String(uniqueCount);
  stats.appendChild(uniqueLabel);

  stats.appendChild(document.createTextNode(' unique component'));
  if (uniqueCount !== 1) {
    stats.appendChild(document.createTextNode('s'));
  }
  stats.appendChild(document.createTextNode(' • '));

  const totalLabel = document.createElement('strong');
  totalLabel.textContent = String(totalCount);
  stats.appendChild(totalLabel);

  stats.appendChild(document.createTextNode(' total instance'));
  if (totalCount !== 1) {
    stats.appendChild(document.createTextNode('s'));
  }

  return stats;
}

function createComponentElement(component: ComponentInfo): HTMLDivElement {
  const componentDiv = document.createElement('div');
  componentDiv.className = 'wc-component';

  const name = document.createElement('div');
  name.className = 'wc-component-name';
  name.textContent = `<${component.name}>`;
  componentDiv.appendChild(name);

  const count = document.createElement('div');
  count.className = 'wc-component-count';
  count.textContent = `${component.count} instance${component.count !== 1 ? 's' : ''}`;
  componentDiv.appendChild(count);

  // Attributes Section
  if (component.attributes.size > 0) {
    const attributesSection = document.createElement('div');
    attributesSection.className = 'wc-section';

    const attrTitle = document.createElement('div');
    attrTitle.className = 'wc-section-title';
    attrTitle.textContent = 'Attributes';
    attributesSection.appendChild(attrTitle);

    const attributesDiv = document.createElement('div');
    attributesDiv.className = 'wc-component-attributes';

    component.attributes.forEach((values, attrName) => {
      const uniqueValues = Array.from(values);
      
      uniqueValues.forEach((value) => {
        const attrSpan = document.createElement('span');
        attrSpan.className = 'wc-attribute';

        const attrNameSpan = document.createElement('span');
        attrNameSpan.className = 'wc-attribute-name';
        attrNameSpan.textContent = attrName;
        attrSpan.appendChild(attrNameSpan);

        if (value !== null && value !== '') {
          attrSpan.appendChild(document.createTextNode('="'));
          const attrValueSpan = document.createElement('span');
          attrValueSpan.className = 'wc-attribute-value';
          attrValueSpan.textContent = value;
          attrSpan.appendChild(attrValueSpan);
          attrSpan.appendChild(document.createTextNode('"'));
        }

        attributesDiv.appendChild(attrSpan);
      });
    });

    attributesSection.appendChild(attributesDiv);
    componentDiv.appendChild(attributesSection);
  }

  // Properties Section
  if (component.properties.size > 0) {
    const propertiesSection = document.createElement('div');
    propertiesSection.className = 'wc-section';

    const propTitle = document.createElement('div');
    propTitle.className = 'wc-section-title';
    propTitle.textContent = 'Properties';
    propertiesSection.appendChild(propTitle);

    component.properties.forEach((values, propName) => {
      const uniqueValues = Array.from(values);
      
      uniqueValues.forEach((value) => {
        const propDiv = document.createElement('div');
        propDiv.className = 'wc-property';

        const propNameSpan = document.createElement('span');
        propNameSpan.className = 'wc-property-name';
        propNameSpan.textContent = propName;
        propDiv.appendChild(propNameSpan);

        propDiv.appendChild(document.createTextNode(': '));

        const propValueSpan = document.createElement('span');
        propValueSpan.className = 'wc-property-value';
        propValueSpan.textContent = formatPropertyValue(value);
        propDiv.appendChild(propValueSpan);

        propDiv.appendChild(document.createTextNode(' '));

        const propTypeSpan = document.createElement('span');
        propTypeSpan.className = 'wc-property-type';
        propTypeSpan.textContent = `(${getValueType(value)})`;
        propDiv.appendChild(propTypeSpan);

        propertiesSection.appendChild(propDiv);
      });
    });

    componentDiv.appendChild(propertiesSection);
  }

  // Methods Section
  if (component.methods.size > 0) {
    const methodsSection = document.createElement('div');
    methodsSection.className = 'wc-section';

    const methodTitle = document.createElement('div');
    methodTitle.className = 'wc-section-title';
    methodTitle.textContent = 'Public Methods';
    methodsSection.appendChild(methodTitle);

    const methodsDiv = document.createElement('div');

    Array.from(component.methods).sort().forEach((methodName) => {
      const methodSpan = document.createElement('span');
      methodSpan.className = 'wc-method';

      const methodNameSpan = document.createElement('span');
      methodNameSpan.className = 'wc-method-name';
      methodNameSpan.textContent = `${methodName}()`;
      methodSpan.appendChild(methodNameSpan);

      methodsDiv.appendChild(methodSpan);
    });

    methodsSection.appendChild(methodsDiv);
    componentDiv.appendChild(methodsSection);
  }

  // Slots Section
  if (component.slots.size > 0) {
    const slotsSection = document.createElement('div');
    slotsSection.className = 'wc-section';

    const slotTitle = document.createElement('div');
    slotTitle.className = 'wc-section-title';
    slotTitle.textContent = 'Slots';
    slotsSection.appendChild(slotTitle);

    const slotsDiv = document.createElement('div');

    component.slots.forEach((hasContent, slotName) => {
      const slotSpan = document.createElement('span');
      slotSpan.className = hasContent ? 'wc-slot has-content' : 'wc-slot';

      const slotNameSpan = document.createElement('span');
      slotNameSpan.className = 'wc-slot-name';
      slotNameSpan.textContent = slotName === 'default' ? '<slot>' : `<slot name="${slotName}">`;
      slotSpan.appendChild(slotNameSpan);

      slotSpan.appendChild(document.createTextNode(' '));

      const slotStatusSpan = document.createElement('span');
      slotStatusSpan.className = 'wc-slot-status';
      slotStatusSpan.textContent = hasContent ? '(has content)' : '(empty)';
      slotSpan.appendChild(slotStatusSpan);

      slotsDiv.appendChild(slotSpan);
    });

    slotsSection.appendChild(slotsDiv);
    componentDiv.appendChild(slotsSection);
  }

  return componentDiv;
}

function formatPropertyValue(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value === 'function') return '[Function]';
  if (Array.isArray(value)) return `[${value.length} items]`;
  if (typeof value === 'object') {
    try {
      const str = JSON.stringify(value);
      return str.length > 50 ? `${str.substring(0, 47)}...` : str;
    } catch {
      return '[Object]';
    }
  }
  return String(value);
}

function getValueType(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

function watchForChanges(panel: HTMLDivElement): void {
  let updateTimeout: ReturnType<typeof setTimeout>;
  const observer = new MutationObserver(() => {
    if (panel.classList.contains('visible')) {
      clearTimeout(updateTimeout);
      updateTimeout = setTimeout(() => {
        updateComponentList();
      }, 300);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false,
  });
}

function getPositionStyles(position: string, isPanel: boolean = false): string {
  const offset = isPanel ? '70px' : '20px';

  switch (position) {
    case 'top-left':
      return isPanel ? `top: ${offset}; left: 20px;` : `top: 20px; left: 20px;`;
    case 'top-right':
      return isPanel ? `top: ${offset}; right: 20px;` : `top: 20px; right: 20px;`;
    case 'bottom-left':
      return isPanel ? `bottom: ${offset}; left: 20px;` : `bottom: 20px; left: 20px;`;
    case 'bottom-right':
    default:
      return isPanel ? `bottom: ${offset}; right: 20px;` : `bottom: 20px; right: 20px;`;
  }
}

// Auto-initialize if config is provided via global
declare global {
  interface Window {
    __WC_DEVTOOLS_CONFIG__?: DevToolsConfig;
  }
}

if (typeof window !== 'undefined' && window.__WC_DEVTOOLS_CONFIG__) {
  initDevTools(window.__WC_DEVTOOLS_CONFIG__);
}
