// Undo/Redo Manager for property and attribute changes

export interface Change {
  element: Element;
  type: 'attribute' | 'property';
  name: string;
  oldValue: unknown;
  newValue: unknown;
  timestamp: number;
}

export class UndoManager {
  private undoStack: Change[] = [];
  private redoStack: Change[] = [];
  private maxStackSize = 50;
  private onChangeCallback?: () => void;

  /**
   * Record a new change
   */
  recordChange(change: Change): void {
    this.undoStack.push(change);

    // Clear redo stack when a new change is made
    this.redoStack = [];

    // Limit stack size
    if (this.undoStack.length > this.maxStackSize) {
      this.undoStack.shift();
    }

    this.notifyChange();
  }

  /**
   * Undo the last change
   */
  undo(): boolean {
    const change = this.undoStack.pop();
    if (!change) return false;

    // Apply the old value
    this.applyChange(change.element, change.type, change.name, change.oldValue);

    // Move to redo stack
    this.redoStack.push(change);

    this.notifyChange();
    return true;
  }

  /**
   * Redo the last undone change
   */
  redo(): boolean {
    const change = this.redoStack.pop();
    if (!change) return false;

    // Apply the new value
    this.applyChange(change.element, change.type, change.name, change.newValue);

    // Move back to undo stack
    this.undoStack.push(change);

    this.notifyChange();
    return true;
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
    this.notifyChange();
  }

  /**
   * Get the undo stack size
   */
  getUndoCount(): number {
    return this.undoStack.length;
  }

  /**
   * Get the redo stack size
   */
  getRedoCount(): number {
    return this.redoStack.length;
  }

  /**
   * Set a callback to be called when the undo/redo state changes
   */
  setOnChangeCallback(callback: () => void): void {
    this.onChangeCallback = callback;
  }

  /**
   * Apply a change to an element
   */
  private applyChange(
    element: Element,
    type: 'attribute' | 'property',
    name: string,
    value: unknown,
  ): void {
    if (type === 'attribute') {
      if (value === null || value === undefined) {
        element.removeAttribute(name);
      } else if (typeof value === 'object') {
        // For objects, try to stringify them
        try {
          element.setAttribute(name, JSON.stringify(value));
        } catch {
          element.setAttribute(name, '[Object]');
        }
      } else if (typeof value === 'symbol' || typeof value === 'bigint') {
        element.setAttribute(name, value.toString());
      } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        element.setAttribute(name, String(value));
      } else {
        // For any other unexpected types
        element.setAttribute(name, '[Unknown]');
      }
    } else {
      // Property
      (element as any)[name] = value;
    }
  }

  /**
   * Notify that the undo/redo state has changed
   */
  private notifyChange(): void {
    if (this.onChangeCallback) {
      this.onChangeCallback();
    }
  }
}
