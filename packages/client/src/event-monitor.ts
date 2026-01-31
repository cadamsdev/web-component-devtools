// Event monitoring for Web Component Dev Tools

import type { EventLog } from './types';
import { scanWebComponents } from './scanner';

export const MAX_EVENT_LOGS = 100;

export class EventMonitor {
  private eventLogs: EventLog[] = [];
  private isMonitoring = false;
  private eventListeners = new Map<Element, Map<string, EventListener>>();
  private updateCallback?: () => void;

  setUpdateCallback(callback: () => void): void {
    this.updateCallback = callback;
  }

  isEnabled(): boolean {
    return this.isMonitoring;
  }

  getEventLogs(): EventLog[] {
    return this.eventLogs;
  }

  clearLogs(): void {
    this.eventLogs.length = 0;
    this.updateCallback?.();
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

  private startMonitoring(): void {
    const instances = scanWebComponents();
    
    instances.forEach(instance => {
      const element = instance.element;
      
      // Get all event names from the element's prototype
      const eventNames = this.getCustomEventNames(element);
      
      // Also listen for common custom events
      const commonEvents = ['change', 'input', 'click', 'submit', 'close', 'open', 'load', 'error'];
      const allEvents = new Set([...eventNames, ...commonEvents]);
      
      const listenersMap = new Map<string, EventListener>();
      
      allEvents.forEach(eventName => {
        const listener = (event: Event) => {
          const customEvent = event as CustomEvent;
          this.eventLogs.unshift({
            timestamp: Date.now(),
            eventType: event.type,
            tagName: element.tagName.toLowerCase(),
            element: element,
            detail: customEvent.detail
          });
          
          // Keep only the last MAX_EVENT_LOGS events
          if (this.eventLogs.length > MAX_EVENT_LOGS) {
            this.eventLogs.splice(MAX_EVENT_LOGS);
          }
          
          // Update the events list if the events tab is active
          const eventsContent = document.getElementById('wc-devtools-events');
          if (eventsContent && eventsContent.classList.contains('active')) {
            this.updateCallback?.();
          }
        };
        
        element.addEventListener(eventName, listener);
        listenersMap.set(eventName, listener);
      });
      
      this.eventListeners.set(element, listenersMap);
    });
  }

  private stopMonitoring(): void {
    // Remove all event listeners
    this.eventListeners.forEach((listenersMap, element) => {
      listenersMap.forEach((listener, eventName) => {
        element.removeEventListener(eventName, listener);
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
}
