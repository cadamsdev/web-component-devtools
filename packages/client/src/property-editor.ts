// Property and Attribute Editor with Type Validation

import { UndoManager, type Change } from './undo-manager';

export interface ValidationResult {
  valid: boolean;
  error?: string;
  value?: unknown;
}

export class PropertyEditor {
  private undoManager: UndoManager;

  constructor(undoManager: UndoManager) {
    this.undoManager = undoManager;
  }

  /**
   * Validate and parse a value based on its expected type
   */
  validateValue(rawValue: string, expectedType: string): ValidationResult {
    const trimmed = rawValue.trim();

    switch (expectedType) {
      case 'boolean':
        return this.validateBoolean(trimmed);

      case 'number':
        return this.validateNumber(trimmed);

      case 'string':
        return { valid: true, value: rawValue };

      case 'array':
        return this.validateArray(trimmed);

      case 'object':
        return this.validateObject(trimmed);

      case 'null':
        if (trimmed.toLowerCase() === 'null') {
          return { valid: true, value: null };
        }
        return { valid: false, error: 'Expected "null"' };

      case 'undefined':
        if (trimmed.toLowerCase() === 'undefined') {
          return { valid: true, value: undefined };
        }
        return { valid: false, error: 'Expected "undefined"' };

      default:
        // Try to auto-detect type
        return this.autoDetectAndValidate(trimmed);
    }
  }

  /**
   * Set an attribute value with validation
   */
  setAttribute(
    element: Element,
    attrName: string,
    newValue: string | null,
    updateCallback?: () => void,
  ): boolean {
    const oldValue = element.getAttribute(attrName);

    // Record the change
    const change: Change = {
      element,
      type: 'attribute',
      name: attrName,
      oldValue,
      newValue,
      timestamp: Date.now(),
    };

    // Apply the change
    if (newValue === null) {
      element.removeAttribute(attrName);
    } else {
      element.setAttribute(attrName, newValue);
    }

    // Record in undo manager
    this.undoManager.recordChange(change);

    // Call update callback
    if (updateCallback) {
      updateCallback();
    }

    return true;
  }

  /**
   * Set a property value with validation
   */
  setProperty(
    element: Element,
    propName: string,
    newValue: unknown,
    updateCallback?: () => void,
  ): boolean {
    const oldValue = (element as any)[propName];

    // Record the change
    const change: Change = {
      element,
      type: 'property',
      name: propName,
      oldValue,
      newValue,
      timestamp: Date.now(),
    };

    // Apply the change
    try {
      (element as any)[propName] = newValue;
    } catch (error) {
      console.error('Failed to set property:', error);
      return false;
    }

    // Record in undo manager
    this.undoManager.recordChange(change);

    // Call update callback
    if (updateCallback) {
      updateCallback();
    }

    return true;
  }

  /**
   * Validate boolean value
   */
  private validateBoolean(value: string): ValidationResult {
    const lower = value.toLowerCase();
    if (lower === 'true') {
      return { valid: true, value: true };
    }
    if (lower === 'false') {
      return { valid: true, value: false };
    }
    return { valid: false, error: 'Expected "true" or "false"' };
  }

  /**
   * Validate number value
   */
  private validateNumber(value: string): ValidationResult {
    if (value === '') {
      return { valid: false, error: 'Number cannot be empty' };
    }

    const num = Number(value);
    if (isNaN(num)) {
      return { valid: false, error: 'Invalid number format' };
    }

    return { valid: true, value: num };
  }

  /**
   * Validate array value
   */
  private validateArray(value: string): ValidationResult {
    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) {
        return { valid: false, error: 'Expected an array (e.g., [1, 2, 3])' };
      }
      return { valid: true, value: parsed };
    } catch {
      return { valid: false, error: 'Invalid JSON array format' };
    }
  }

  /**
   * Validate object value
   */
  private validateObject(value: string): ValidationResult {
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        return { valid: false, error: 'Expected an object (e.g., {"key": "value"})' };
      }
      return { valid: true, value: parsed };
    } catch {
      return { valid: false, error: 'Invalid JSON object format' };
    }
  }

  /**
   * Auto-detect type and validate
   */
  private autoDetectAndValidate(value: string): ValidationResult {
    // Try null
    if (value.toLowerCase() === 'null') {
      return { valid: true, value: null };
    }

    // Try undefined
    if (value.toLowerCase() === 'undefined') {
      return { valid: true, value: undefined };
    }

    // Try boolean
    const boolResult = this.validateBoolean(value);
    if (boolResult.valid) {
      return boolResult;
    }

    // Try number
    const numResult = this.validateNumber(value);
    if (numResult.valid) {
      return numResult;
    }

    // Try JSON (array or object)
    if (value.startsWith('[') || value.startsWith('{')) {
      try {
        const parsed = JSON.parse(value);
        return { valid: true, value: parsed };
      } catch {
        return { valid: false, error: 'Invalid JSON format' };
      }
    }

    // Default to string
    return { valid: true, value };
  }
}
