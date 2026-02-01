// Event monitoring for Web Component Dev Tools

import type { EventLog, EventFilter, EventBreakpoint, EventPropagationPath } from './types';
import { scanWebComponents } from './scanner';

export const MAX_EVENT_LOGS = 100;

export class EventMonitor {
  private eventLogs: EventLog[] = [];
  private isMonitoring = false;
  private eventListeners = new Map<Element, Map<string, EventListener>>();
  private updateCallback?: () => void;

  // Enhanced features
  private eventFilter: EventFilter = {
    eventTypes: [],
    components: [],
    onlyPreventedDefaults: false,
    onlyStoppedPropagation: false,
    searchText: '',
  };
  private eventBreakpoints = new Map<string, EventBreakpoint>();
  private capturedEvents = new Map<number, Event>(); // Store events for replay

  setUpdateCallback(callback: () => void): void {
    this.updateCallback = callback;
  }

  isEnabled(): boolean {
    return this.isMonitoring;
  }

  getEventLogs(): EventLog[] {
    return this.eventLogs;
  }

  getFilteredEventLogs(): EventLog[] {
    return this.eventLogs.filter((log) => this.matchesFilter(log));
  }

  clearLogs(): void {
    this.eventLogs.length = 0;
    this.capturedEvents.clear();
    this.updateCallback?.();
  }

  // Filter management
  setFilter(filter: Partial<EventFilter>): void {
    this.eventFilter = { ...this.eventFilter, ...filter };
    this.updateCallback?.();
  }

  getFilter(): EventFilter {
    return { ...this.eventFilter };
  }

  resetFilter(): void {
    this.eventFilter = {
      eventTypes: [],
      components: [],
      onlyPreventedDefaults: false,
      onlyStoppedPropagation: false,
      searchText: '',
    };
    this.updateCallback?.();
  }

  // Breakpoint management
  addBreakpoint(eventType: string, componentTagName?: string): void {
    const key = this.getBreakpointKey(eventType, componentTagName);
    this.eventBreakpoints.set(key, {
      eventType,
      componentTagName,
      enabled: true,
    });
  }

  removeBreakpoint(eventType: string, componentTagName?: string): void {
    const key = this.getBreakpointKey(eventType, componentTagName);
    this.eventBreakpoints.delete(key);
  }

  toggleBreakpoint(eventType: string, componentTagName?: string): void {
    const key = this.getBreakpointKey(eventType, componentTagName);
    const breakpoint = this.eventBreakpoints.get(key);
    if (breakpoint) {
      breakpoint.enabled = !breakpoint.enabled;
    }
  }

  getBreakpoints(): EventBreakpoint[] {
    return Array.from(this.eventBreakpoints.values());
  }

  private getBreakpointKey(eventType: string, componentTagName?: string): string {
    return componentTagName ? `${eventType}:${componentTagName}` : eventType;
  }

  private checkBreakpoint(eventType: string, componentTagName: string): boolean {
    // Check for specific component breakpoint
    const specificKey = this.getBreakpointKey(eventType, componentTagName);
    const specificBreakpoint = this.eventBreakpoints.get(specificKey);
    if (specificBreakpoint?.enabled) {
      return true;
    }

    // Check for general event type breakpoint
    const generalKey = this.getBreakpointKey(eventType);
    const generalBreakpoint = this.eventBreakpoints.get(generalKey);
    return generalBreakpoint?.enabled || false;
  }

  // Event replay
  replayEvent(timestamp: number): boolean {
    const originalEvent = this.capturedEvents.get(timestamp);
    const log = this.eventLogs.find((l) => l.timestamp === timestamp);

    if (!originalEvent || !log) {
      console.warn('Event not found for replay:', timestamp);
      return false;
    }

    try {
      // Create a new event with the same properties
      const eventInit: CustomEventInit = {
        bubbles: log.bubbles,
        cancelable: log.cancelable,
        composed: log.composed,
        detail: log.detail,
      };

      const replayEvent = new CustomEvent(log.eventType, eventInit);
      log.element.dispatchEvent(replayEvent);

      console.log('Event replayed:', log.eventType, 'on', log.tagName);
      return true;
    } catch (error) {
      console.error('Failed to replay event:', error);
      return false;
    }
  }

  toggle(): void {
    this.isMonitoring = !this.isMonitoring;

    if (this.isMonitoring) {
      this.startMonitoring();
    } else {
      this.stopMonitoring();
    }

    this.updateCallback?.();
  }

  private matchesFilter(log: EventLog): boolean {
    // Filter by event type
    if (
      this.eventFilter.eventTypes.length > 0 &&
      !this.eventFilter.eventTypes.includes(log.eventType)
    ) {
      return false;
    }

    // Filter by component
    if (
      this.eventFilter.components.length > 0 &&
      !this.eventFilter.components.includes(log.tagName)
    ) {
      return false;
    }

    // Filter by prevented defaults
    if (this.eventFilter.onlyPreventedDefaults && !log.defaultPrevented) {
      return false;
    }

    // Filter by stopped propagation
    if (this.eventFilter.onlyStoppedPropagation && !log.propagationStopped) {
      return false;
    }

    // Filter by search text
    if (this.eventFilter.searchText) {
      const searchLower = this.eventFilter.searchText.toLowerCase();
      const detailStr = log.detail ? JSON.stringify(log.detail).toLowerCase() : '';
      if (
        !log.eventType.toLowerCase().includes(searchLower) &&
        !log.tagName.toLowerCase().includes(searchLower) &&
        !detailStr.includes(searchLower)
      ) {
        return false;
      }
    }

    return true;
  }

  private buildPropagationPath(event: Event): EventPropagationPath[] {
    const path: EventPropagationPath[] = [];
    const composedPath = event.composedPath();

    composedPath.forEach((target, index) => {
      if (target instanceof Element) {
        let phase: 'capturing' | 'target' | 'bubbling';

        if (target === event.target) {
          phase = 'target';
        } else if (index < composedPath.indexOf(event.target as EventTarget)) {
          phase = 'capturing';
        } else {
          phase = 'bubbling';
        }

        path.push({
          element: target,
          tagName: target.tagName?.toLowerCase() || 'unknown',
          phase,
        });
      }
    });

    return path;
  }

  private startMonitoring(): void {
    const instances = scanWebComponents();

    instances.forEach((instance) => {
      const element = instance.element;

      // Get all event names from the element's prototype
      const eventNames = this.getCustomEventNames(element);

      // Also listen for common custom events
      const commonEvents = ['change', 'input', 'click', 'submit', 'close', 'open', 'load', 'error'];
      const allEvents = new Set([...eventNames, ...commonEvents]);

      const listenersMap = new Map<string, EventListener>();

      allEvents.forEach((eventName) => {
        // Create a capturing listener to track all phases
        const listener = (event: Event) => {
          const customEvent = event as CustomEvent;
          const tagName = element.tagName.toLowerCase();

          // Check for breakpoint
          if (this.checkBreakpoint(event.type, tagName)) {
            // eslint-disable-next-line no-debugger
            debugger; // Break execution when breakpoint is hit
          }

          // Build propagation path
          const propagationPath = this.buildPropagationPath(event);

          const eventLog: EventLog = {
            timestamp: Date.now(),
            eventType: event.type,
            tagName: tagName,
            element: element,
            detail: customEvent.detail,
            propagationPath,
            defaultPrevented: event.defaultPrevented,
            propagationStopped: false, // Will be updated if stopPropagation is called
            immediatePropagationStopped: false,
            bubbles: event.bubbles,
            cancelable: event.cancelable,
            composed: event.composed,
            isTrusted: event.isTrusted,
            currentTarget: event.currentTarget as Element | null,
          };

          // Store the event for replay
          this.capturedEvents.set(eventLog.timestamp, event);

          // Wrap stopPropagation to track when it's called
          const originalStopPropagation = event.stopPropagation.bind(event);
          const originalStopImmediatePropagation = event.stopImmediatePropagation.bind(event);

          event.stopPropagation = () => {
            eventLog.propagationStopped = true;
            originalStopPropagation();
          };

          event.stopImmediatePropagation = () => {
            eventLog.immediatePropagationStopped = true;
            eventLog.propagationStopped = true;
            originalStopImmediatePropagation();
          };

          this.eventLogs.unshift(eventLog);

          // Keep only the last MAX_EVENT_LOGS events
          if (this.eventLogs.length > MAX_EVENT_LOGS) {
            const removed = this.eventLogs.splice(MAX_EVENT_LOGS);
            // Clean up stored events
            removed.forEach((log) => this.capturedEvents.delete(log.timestamp));
          }

          // Update the events list if the events tab is active
          const eventsContent = document.getElementById('wc-devtools-events');
          if (eventsContent && eventsContent.classList.contains('active')) {
            this.updateCallback?.();
          }
        };

        // Listen in capturing phase to catch all events
        element.addEventListener(eventName, listener, { capture: true });
        listenersMap.set(eventName, listener);
      });

      this.eventListeners.set(element, listenersMap);
    });
  }

  private stopMonitoring(): void {
    // Remove all event listeners
    this.eventListeners.forEach((listenersMap, element) => {
      listenersMap.forEach((listener, eventName) => {
        element.removeEventListener(eventName, listener, { capture: true });
      });
    });

    this.eventListeners.clear();
  }

  private getCustomEventNames(element: Element): string[] {
    const eventNames: string[] = [];

    // Try to find event names from property descriptors
    const proto = Object.getPrototypeOf(element);
    if (proto && proto !== HTMLElement.prototype) {
      const descriptors = Object.getOwnPropertyDescriptors(proto);

      for (const propName in descriptors) {
        // Look for properties that might be event handlers (on* pattern)
        if (propName.startsWith('on') && propName.length > 2) {
          const eventName = propName.substring(2);
          eventNames.push(eventName);
        }
      }
    }

    return eventNames;
  }

  // Get unique event types from all logs
  getUniqueEventTypes(): string[] {
    const types = new Set<string>();
    this.eventLogs.forEach((log) => types.add(log.eventType));
    return Array.from(types).sort();
  }

  // Get unique component tags from all logs
  getUniqueComponents(): string[] {
    const components = new Set<string>();
    this.eventLogs.forEach((log) => components.add(log.tagName));
    return Array.from(components).sort();
  }
}
