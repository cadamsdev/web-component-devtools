// Utility functions for Web Component Dev Tools

export function highlightElement(element: Element): void {
  element.classList.add('wc-element-highlight');
}

export function unhighlightElement(element: Element): void {
  element.classList.remove('wc-element-highlight');
}

export function formatPropertyValue(value: unknown): string {
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

export function getValueType(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

export function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  if (diff < 1000) {
    return 'just now';
  } else if (diff < 60000) {
    return `${Math.floor(diff / 1000)}s ago`;
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}m ago`;
  } else {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  }
}

export function formatEventDetail(detail: unknown): string {
  if (detail === null) return 'null';
  if (detail === undefined) return 'undefined';
  if (typeof detail === 'string') return detail;
  if (typeof detail === 'number' || typeof detail === 'boolean') return String(detail);

  try {
    return JSON.stringify(detail, null, 2);
  } catch {
    return String(detail);
  }
}

/**
 * Create an expandable JSON tree viewer for complex objects
 */
export function createJSONTreeElement(data: unknown, depth: number = 0): HTMLElement {
  const container = document.createElement('div');
  container.className = 'wc-json-tree';
  container.style.marginLeft = `${depth * 16}px`;

  if (data === null) {
    container.textContent = 'null';
    container.className += ' wc-json-null';
    return container;
  }

  if (data === undefined) {
    container.textContent = 'undefined';
    container.className += ' wc-json-undefined';
    return container;
  }

  const dataType = typeof data;

  if (dataType === 'string') {
    container.textContent = `"${data}"`;
    container.className += ' wc-json-string';
    return container;
  }

  if (dataType === 'number' || dataType === 'boolean') {
    container.textContent = String(data);
    container.className += ` wc-json-${dataType}`;
    return container;
  }

  if (Array.isArray(data)) {
    const header = document.createElement('div');
    header.className = 'wc-json-header wc-json-expandable';

    const toggle = document.createElement('span');
    toggle.className = 'wc-json-toggle';
    toggle.textContent = '▶';
    header.appendChild(toggle);

    const label = document.createElement('span');
    label.textContent = `Array(${data.length})`;
    header.appendChild(label);

    const content = document.createElement('div');
    content.className = 'wc-json-content';
    content.style.display = 'none';

    data.forEach((item, index) => {
      const itemContainer = document.createElement('div');
      itemContainer.className = 'wc-json-item';

      const itemLabel = document.createElement('span');
      itemLabel.className = 'wc-json-key';
      itemLabel.textContent = `${index}: `;
      itemContainer.appendChild(itemLabel);

      const itemValue = createJSONTreeElement(item, depth + 1);
      itemValue.style.display = 'inline-block';
      itemValue.style.marginLeft = '0';
      itemContainer.appendChild(itemValue);

      content.appendChild(itemContainer);
    });

    header.addEventListener('click', () => {
      const isExpanded = content.style.display === 'block';
      content.style.display = isExpanded ? 'none' : 'block';
      toggle.textContent = isExpanded ? '▶' : '▼';
      header.classList.toggle('expanded');
    });

    container.appendChild(header);
    container.appendChild(content);
    return container;
  }

  if (dataType === 'object') {
    const entries = Object.entries(data as Record<string, unknown>);

    const header = document.createElement('div');
    header.className = 'wc-json-header wc-json-expandable';

    const toggle = document.createElement('span');
    toggle.className = 'wc-json-toggle';
    toggle.textContent = '▶';
    header.appendChild(toggle);

    const label = document.createElement('span');
    label.textContent = `Object {${entries.length}}`;
    header.appendChild(label);

    const content = document.createElement('div');
    content.className = 'wc-json-content';
    content.style.display = 'none';

    entries.forEach(([key, value]) => {
      const itemContainer = document.createElement('div');
      itemContainer.className = 'wc-json-item';

      const itemLabel = document.createElement('span');
      itemLabel.className = 'wc-json-key';
      itemLabel.textContent = `${key}: `;
      itemContainer.appendChild(itemLabel);

      const itemValue = createJSONTreeElement(value, depth + 1);
      itemValue.style.display = 'inline-block';
      itemValue.style.marginLeft = '0';
      itemContainer.appendChild(itemValue);

      content.appendChild(itemContainer);
    });

    header.addEventListener('click', () => {
      const isExpanded = content.style.display === 'block';
      content.style.display = isExpanded ? 'none' : 'block';
      toggle.textContent = isExpanded ? '▶' : '▼';
      header.classList.toggle('expanded');
    });

    container.appendChild(header);
    container.appendChild(content);
    return container;
  }

  container.textContent = String(data);
  return container;
}
