// Utility functions for Web Component Dev Tools

// Store original styles for elements being highlighted
const originalStyles = new WeakMap<
  Element,
  {
    outline: string;
    outlineOffset: string;
    boxShadow: string;
    position: string;
    zIndex: string;
    background: string;
    animation: string;
  }
>();

export function highlightElement(element: Element): void {
  const htmlElement = element as HTMLElement;

  // Store original styles if not already stored
  if (!originalStyles.has(element)) {
    originalStyles.set(element, {
      outline: htmlElement.style.outline,
      outlineOffset: htmlElement.style.outlineOffset,
      boxShadow: htmlElement.style.boxShadow,
      position: htmlElement.style.position,
      zIndex: htmlElement.style.zIndex,
      background: htmlElement.style.background,
      animation: htmlElement.style.animation,
    });
  }

  // Apply highlight styles inline (works even in shadow DOM)
  htmlElement.style.setProperty('outline', '3px solid #667eea', 'important');
  htmlElement.style.setProperty('outline-offset', '4px', 'important');
  htmlElement.style.setProperty(
    'box-shadow',
    '0 0 0 4px rgba(102, 126, 234, 0.3), 0 0 20px rgba(102, 126, 234, 0.4)',
    'important',
  );
  htmlElement.style.setProperty('z-index', '999997', 'important');

  // Add a semi-transparent background overlay if the element doesn't have a solid background
  const computedStyle = window.getComputedStyle(htmlElement);
  const currentBg = computedStyle.backgroundColor;
  if (currentBg === 'rgba(0, 0, 0, 0)' || currentBg === 'transparent') {
    htmlElement.style.setProperty('background', 'rgba(102, 126, 234, 0.1)', 'important');
  }

  // Also add the class for any light DOM styles
  element.classList.add('wc-element-highlight');
}

export function unhighlightElement(element: Element): void {
  const htmlElement = element as HTMLElement;

  // Restore original styles if they were stored
  const original = originalStyles.get(element);
  if (original) {
    htmlElement.style.outline = original.outline;
    htmlElement.style.outlineOffset = original.outlineOffset;
    htmlElement.style.boxShadow = original.boxShadow;
    htmlElement.style.position = original.position;
    htmlElement.style.zIndex = original.zIndex;
    htmlElement.style.background = original.background;
    htmlElement.style.animation = original.animation;

    // Clean up stored styles
    originalStyles.delete(element);
  }

  // Remove the class
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
  // For any other primitive types (symbol, bigint)
  return typeof value === 'symbol' || typeof value === 'bigint' ? value.toString() : '[Unknown]';
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
    // If JSON.stringify fails, try to convert to string safely
    if (typeof detail === 'object' && detail !== null) {
      return '[Object]';
    }
    return typeof detail === 'symbol' || typeof detail === 'bigint' ? detail.toString() : '[Unknown]';
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
    container.textContent = `"${data as string}"`;
    container.className += ' wc-json-string';
    return container;
  }

  if (dataType === 'number' || dataType === 'boolean') {
    // TypeScript knows data is number or boolean here, so String() is safe
    container.textContent = (data as number | boolean).toString();
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

  // For any other types (objects, functions, etc.)
  if (typeof data === 'object' && data !== null) {
    try {
      container.textContent = JSON.stringify(data);
    } catch {
      container.textContent = '[Object]';
    }
  } else if (typeof data === 'symbol' || typeof data === 'bigint') {
    container.textContent = data.toString();
  } else {
    // For any other unexpected types
    container.textContent = '[Unknown]';
  }
  return container;
}
