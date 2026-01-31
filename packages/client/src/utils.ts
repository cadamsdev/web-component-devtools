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
