// Type definitions for Web Component Dev Tools

export interface InstanceInfo {
  element: Element;
  tagName: string;
  attributes: Map<string, string | null>;
  properties: Map<string, unknown>;
  methods: string[];
  slots: Map<string, boolean>;
}

export interface EventLog {
  timestamp: number;
  eventType: string;
  tagName: string;
  element: Element;
  detail: unknown;
}

export interface DevToolsConfig {
  position: string;
}

export interface DevToolsState {
  expandedStates: Map<Element, boolean>;
  isUpdating: boolean;
  searchFilter: string;
  eventLogs: EventLog[];
  isEventMonitoringEnabled: boolean;
  eventListeners: Map<Element, Map<string, EventListener>>;
}
