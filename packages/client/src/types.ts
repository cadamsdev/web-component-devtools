// Type definitions for Web Component Dev Tools

export interface ShadowDOMInfo {
  hasShadowRoot: boolean;
  mode: 'open' | 'closed' | null;
  adoptedStyleSheets: number;
  styleSheets: CSSStyleSheet[];
  customProperties: Map<string, string>;
  slotAssignments: Map<string, SlotAssignment>;
  children: ShadowDOMNode[];
}

export interface SlotAssignment {
  slotName: string;
  slotElement: HTMLSlotElement;
  assignedNodes: Node[];
  assignedElements: Element[];
  hasContent: boolean;
}

export interface ShadowDOMNode {
  nodeType: number;
  nodeName: string;
  nodeValue: string | null;
  textContent: string | null;
  attributes: Map<string, string | null>;
  isSlot: boolean;
  slotName?: string;
  children: ShadowDOMNode[];
}

export interface InstanceInfo {
  element: Element;
  tagName: string;
  attributes: Map<string, string | null>;
  properties: Map<string, unknown>;
  methods: string[];
  slots: Map<string, boolean>;
  shadowDOM: ShadowDOMInfo | null;
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
