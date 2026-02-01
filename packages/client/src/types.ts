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

export interface CSSVariableInfo {
  name: string;
  value: string;
  computedValue: string;
  source: 'element' | 'shadow-root' | 'inherited' | 'root';
  specificity: number;
  selector?: string;
  inheritedFrom?: Element;
}

export interface InstanceInfo {
  element: Element;
  tagName: string;
  attributes: Map<string, string | null>;
  properties: Map<string, unknown>;
  methods: string[];
  slots: Map<string, boolean>;
  shadowDOM: ShadowDOMInfo | null;
  cssVariables?: CSSVariableInfo[];
  renderCount?: number;
  nestedComponents?: InstanceInfo[];
  parentComponent?: Element | null;
}

export interface EventPropagationPath {
  element: Element;
  tagName: string;
  phase: 'capturing' | 'target' | 'bubbling';
}

export interface EventLog {
  timestamp: number;
  eventType: string;
  tagName: string;
  element: Element;
  detail: unknown;
  // Enhanced event monitoring features
  propagationPath?: EventPropagationPath[];
  defaultPrevented: boolean;
  propagationStopped: boolean;
  immediatePropagationStopped: boolean;
  bubbles: boolean;
  cancelable: boolean;
  composed: boolean;
  isTrusted: boolean;
  currentTarget?: Element | null;
}

export interface EventFilter {
  eventTypes: string[];
  components: string[];
  onlyPreventedDefaults: boolean;
  onlyStoppedPropagation: boolean;
  searchText: string;
}

export interface EventBreakpoint {
  eventType: string;
  componentTagName?: string;
  enabled: boolean;
}

export interface DevToolsConfig {
  position: string;
  queryParam?: string;
}

export interface DevToolsState {
  expandedStates: Map<Element, boolean>;
  isUpdating: boolean;
  searchFilter: string;
  eventLogs: EventLog[];
  isEventMonitoringEnabled: boolean;
  eventListeners: Map<Element, Map<string, EventListener>>;
}
