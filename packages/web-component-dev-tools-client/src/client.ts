// Web Component Dev Tools Client Script
// This script is injected into the page to provide debugging tools for web components

interface ComponentInfo {
  name: string;
  count: number;
  instances: Element[];
  attributes: Set<string>;
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
    '  width: 400px;',
    '  max-height: 600px;',
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
          attributes: new Set<string>(),
        });
      }

      const component = components.get(tagName)!;
      component.count++;
      component.instances.push(element);

      // Collect attributes (more efficient than Array.from)
      const attrs = element.attributes;
      for (let i = 0; i < attrs.length; i++) {
        component.attributes.add(attrs[i].name);
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

  if (component.attributes.size > 0) {
    const attributesDiv = document.createElement('div');
    attributesDiv.className = 'wc-component-attributes';

    const attrLabel = document.createElement('strong');
    attrLabel.textContent = 'Attributes:';
    attributesDiv.appendChild(attrLabel);
    attributesDiv.appendChild(document.createElement('br'));

    Array.from(component.attributes).forEach((attr) => {
      const attrSpan = document.createElement('span');
      attrSpan.className = 'wc-attribute';

      const attrName = document.createElement('span');
      attrName.className = 'wc-attribute-name';
      attrName.textContent = attr;
      attrSpan.appendChild(attrName);

      attributesDiv.appendChild(attrSpan);
    });

    componentDiv.appendChild(attributesDiv);
  }

  return componentDiv;
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
