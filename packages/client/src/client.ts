// Web Component Dev Tools Client Script
// This script is injected into the page to provide debugging tools for web components

interface InstanceInfo {
  element: Element;
  tagName: string;
  attributes: Map<string, string | null>;
  properties: Map<string, unknown>;
  methods: string[];
  slots: Map<string, boolean>;
}

interface EventLog {
  timestamp: number;
  eventType: string;
  tagName: string;
  element: Element;
  detail: unknown;
}

// Track expanded state separately to persist across re-renders
const expandedStates = new Map<Element, boolean>();

// Track if we're currently updating to avoid recursive updates
let isUpdating = false;

// Track the current search filter
let searchFilter = '';

// Track events
const eventLogs: EventLog[] = [];
const MAX_EVENT_LOGS = 100;
let isEventMonitoringEnabled = false;
const eventListeners = new Map<Element, Map<string, EventListener>>();

interface DevToolsConfig {
  position: string;
}

export function initDevTools(config: DevToolsConfig) {
  const { position } = config;

  injectStyles(position);

  const button = createButton();
  const panel = createPanel();

  document.body.appendChild(button);
  document.body.appendChild(panel);

  setupEventListeners(button, panel, position);

  watchForChanges(panel);
  
  setupEventMonitoring();
}

function injectStyles(position: string): void {
  const css = [
    '#wc-devtools-btn {',
    '  position: fixed;',
    `  ${getPositionStyles(position)}`,
    '  width: 50px;',
    '  height: 50px;',
    '  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);',
    '  border: none;',
    '  border-radius: 50%;',
    '  cursor: grab;',
    '  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);',
    '  z-index: 999999;',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  transition: transform 0.3s ease, box-shadow 0.3s ease;',
    '  font-size: 24px;',
    '  color: white;',
    '  user-select: none;',
    '}',
    '',
    '#wc-devtools-btn:hover {',
    '  transform: scale(1.1);',
    '  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);',
    '}',
    '',
    '#wc-devtools-btn:active {',
    '  cursor: grabbing;',
    '}',
    '',
    '#wc-devtools-panel {',
    '  position: fixed;',
    `  ${getPositionStyles(position, true)}`,
    '  width: 500px;',
    '  max-height: 700px;',
    '  background: white;',
    '  border-radius: 12px;',
    '  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);',
    '  z-index: 999998;',
    '  display: none;',
    '  flex-direction: column;',
    '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;',
    '  overflow: hidden;',
    '  transition: left 0.2s ease, top 0.2s ease;',
    '}',
    '',
    '#wc-devtools-panel.visible {',
    '  display: flex;',
    '}',
    '',
    '.wc-devtools-header {',
    '  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);',
    '  color: white;',
    '  padding: 16px;',
    '  font-weight: 600;',
    '  font-size: 16px;',
    '  display: flex;',
    '  justify-content: space-between;',
    '  align-items: center;',
    '}',
    '',
    '.wc-devtools-close {',
    '  background: none;',
    '  border: none;',
    '  color: white;',
    '  font-size: 24px;',
    '  cursor: pointer;',
    '  padding: 0;',
    '  width: 30px;',
    '  height: 30px;',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  border-radius: 4px;',
    '  transition: background 0.2s;',
    '}',
    '',
    '.wc-devtools-close:hover {',
    '  background: rgba(255, 255, 255, 0.2);',
    '}',
    '',
    '.wc-devtools-search {',
    '  padding: 12px 16px;',
    '  background: #f7fafc;',
    '  border-bottom: 1px solid #e2e8f0;',
    '}',
    '',
    '.wc-devtools-search input {',
    '  width: 100%;',
    '  padding: 8px 12px;',
    '  border: 1px solid #cbd5e0;',
    '  border-radius: 6px;',
    '  font-size: 14px;',
    '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;',
    '  outline: none;',
    '  transition: border-color 0.2s, box-shadow 0.2s;',
    '}',
    '',
    '.wc-devtools-search input:focus {',
    '  border-color: #667eea;',
    '  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);',
    '}',
    '',
    '.wc-devtools-search input::placeholder {',
    '  color: #a0aec0;',
    '}',
    '',
    '.wc-devtools-content {',
    '  padding: 16px;',
    '  overflow-y: auto;',
    '  flex: 1;',
    '}',
    '',
    '.wc-component {',
    '  background: #f7fafc;',
    '  border: 1px solid #e2e8f0;',
    '  border-radius: 8px;',
    '  padding: 12px;',
    '  margin-bottom: 12px;',
    '  transition: all 0.2s ease;',
    '}',
    '',
    '.wc-component:hover {',
    '  border-color: #667eea;',
    '  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);',
    '  transform: translateY(-1px);',
    '}',
    '',
    '.wc-instance-header {',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: space-between;',
    '  margin-bottom: 0;',
    '  padding: 4px;',
    '  border-radius: 4px;',
    '  transition: background 0.2s;',
    '}',
    '',
    '.wc-instance-header:hover {',
    '  background: rgba(102, 126, 234, 0.05);',
    '}',
    '',
    '.wc-instance-badge {',
    '  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);',
    '  color: white;',
    '  padding: 2px 8px;',
    '  border-radius: 12px;',
    '  font-weight: 600;',
    '  font-size: 11px;',
    '  margin-right: 8px;',
    '}',
    '',
    '.wc-component-name {',
    '  font-weight: 600;',
    '  color: #2d3748;',
    '  font-size: 14px;',
    '  display: flex;',
    '  align-items: center;',
    '  flex: 1;',
    '}',
    '',
    '.wc-expand-indicator {',
    '  color: #718096;',
    '  font-size: 18px;',
    '  margin-left: 8px;',
    '  transition: transform 0.2s;',
    '  user-select: none;',
    '}',
    '',
    '.wc-component.expanded .wc-expand-indicator {',
    '  transform: rotate(90deg);',
    '}',
    '',
    '.wc-component-details {',
    '  max-height: 0;',
    '  overflow: hidden;',
    '  transition: max-height 0.3s ease;',
    '}',
    '',
    '.wc-component.expanded .wc-component-details {',
    '  max-height: 2000px;',
    '}',
    '',
    '.wc-section {',
    '  margin-top: 12px;',
    '  padding-top: 8px;',
    '  border-top: 1px solid #e2e8f0;',
    '}',
    '',
    '.wc-section-title {',
    '  font-weight: 600;',
    '  font-size: 12px;',
    '  color: #4a5568;',
    '  margin-bottom: 6px;',
    '  text-transform: uppercase;',
    '  letter-spacing: 0.5px;',
    '}',
    '',
    '.wc-component-attributes {',
    '  font-size: 12px;',
    '  color: #4a5568;',
    '}',
    '',
    '.wc-attribute {',
    '  background: white;',
    '  padding: 4px 8px;',
    '  border-radius: 4px;',
    '  margin: 4px 4px 4px 0;',
    '  display: inline-block;',
    '  border: 1px solid #e2e8f0;',
    '}',
    '',
    '.wc-attribute-name {',
    '  color: #805ad5;',
    '  font-weight: 500;',
    '}',
    '',
    '.wc-attribute-value {',
    '  color: #2d3748;',
    '}',
    '',
    '.wc-property {',
    '  background: white;',
    '  padding: 6px 10px;',
    '  border-radius: 4px;',
    '  margin: 4px 0;',
    '  border: 1px solid #e2e8f0;',
    '  font-size: 12px;',
    '}',
    '',
    '.wc-property-name {',
    '  color: #3182ce;',
    '  font-weight: 500;',
    '}',
    '',
    '.wc-property-value {',
    '  color: #2d3748;',
    '  font-family: "Monaco", "Courier New", monospace;',
    '}',
    '',
    '.wc-property-type {',
    '  color: #718096;',
    '  font-style: italic;',
    '  font-size: 11px;',
    '}',
    '',
    '.wc-method {',
    '  background: white;',
    '  padding: 4px 8px;',
    '  border-radius: 4px;',
    '  margin: 4px 4px 4px 0;',
    '  display: inline-block;',
    '  border: 1px solid #e2e8f0;',
    '  font-size: 12px;',
    '  font-family: "Monaco", "Courier New", monospace;',
    '}',
    '',
    '.wc-method-name {',
    '  color: #d69e2e;',
    '  font-weight: 500;',
    '}',
    '',
    '.wc-slot {',
    '  background: white;',
    '  padding: 4px 8px;',
    '  border-radius: 4px;',
    '  margin: 4px 4px 4px 0;',
    '  display: inline-block;',
    '  border: 1px solid #e2e8f0;',
    '  font-size: 12px;',
    '}',
    '',
    '.wc-slot-name {',
    '  color: #38a169;',
    '  font-weight: 500;',
    '}',
    '',
    '.wc-slot-status {',
    '  color: #718096;',
    '  font-size: 11px;',
    '}',
    '',
    '.wc-slot.has-content {',
    '  border-color: #38a169;',
    '  background: #f0fff4;',
    '}',
    '',
    '.wc-no-components {',
    '  text-align: center;',
    '  color: #718096;',
    '  padding: 32px;',
    '}',
    '',
    '.wc-stats {',
    '  background: #edf2f7;',
    '  padding: 12px;',
    '  border-radius: 8px;',
    '  margin-bottom: 16px;',
    '  font-size: 14px;',
    '  color: #2d3748;',
    '}',
    '',
    '.wc-element-highlight {',
    '  outline: 3px solid #667eea !important;',
    '  outline-offset: 4px !important;',
    '  background: rgba(102, 126, 234, 0.2) !important;',
    '  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.3), 0 0 20px rgba(102, 126, 234, 0.4) !important;',
    '  position: relative !important;',
    '  z-index: 999997 !important;',
    '  animation: wc-highlight-pulse 0.6s ease-in-out 3 !important;',
    '}',
    '',
    '@keyframes wc-highlight-pulse {',
    '  0%, 100% {',
    '    outline-width: 3px;',
    '    outline-offset: 4px;',
    '    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.3), 0 0 20px rgba(102, 126, 234, 0.4);',
    '  }',
    '  50% {',
    '    outline-width: 5px;',
    '    outline-offset: 6px;',
    '    box-shadow: 0 0 0 8px rgba(102, 126, 234, 0.4), 0 0 30px rgba(102, 126, 234, 0.6);',
    '  }',
    '}',
    '',
    '.wc-locate-btn {',
    '  background: #667eea;',
    '  color: white;',
    '  border: none;',
    '  border-radius: 4px;',
    '  padding: 6px;',
    '  cursor: pointer;',
    '  transition: all 0.2s ease;',
    '  margin-right: 8px;',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  width: 24px;',
    '  height: 24px;',
    '}',
    '',
    '.wc-locate-btn:hover {',
    '  background: #5568d3;',
    '  transform: scale(1.1);',
    '}',
    '',
    '.wc-locate-btn svg {',
    '  width: 14px;',
    '  height: 14px;',
    '}',
    '',
    '.wc-devtools-tabs {',
    '  display: flex;',
    '  background: #f7fafc;',
    '  border-bottom: 2px solid #e2e8f0;',
    '}',
    '',
    '.wc-devtools-tab {',
    '  flex: 1;',
    '  padding: 12px 16px;',
    '  background: none;',
    '  border: none;',
    '  font-size: 14px;',
    '  font-weight: 500;',
    '  color: #718096;',
    '  cursor: pointer;',
    '  transition: all 0.2s;',
    '  border-bottom: 2px solid transparent;',
    '  margin-bottom: -2px;',
    '}',
    '',
    '.wc-devtools-tab:hover {',
    '  color: #667eea;',
    '  background: rgba(102, 126, 234, 0.05);',
    '}',
    '',
    '.wc-devtools-tab.active {',
    '  color: #667eea;',
    '  border-bottom-color: #667eea;',
    '  background: white;',
    '}',
    '',
    '.wc-devtools-tab-content {',
    '  display: none;',
    '}',
    '',
    '.wc-devtools-tab-content.active {',
    '  display: block;',
    '}',
    '',
    '.wc-events-controls {',
    '  display: flex;',
    '  gap: 8px;',
    '  padding: 12px 16px;',
    '  background: #f7fafc;',
    '  border-bottom: 1px solid #e2e8f0;',
    '}',
    '',
    '.wc-events-toggle {',
    '  flex: 1;',
    '  padding: 8px 16px;',
    '  background: #667eea;',
    '  color: white;',
    '  border: none;',
    '  border-radius: 6px;',
    '  font-size: 14px;',
    '  font-weight: 500;',
    '  cursor: pointer;',
    '  transition: all 0.2s;',
    '}',
    '',
    '.wc-events-toggle:hover {',
    '  background: #5568d3;',
    '}',
    '',
    '.wc-events-toggle.monitoring {',
    '  background: #48bb78;',
    '}',
    '',
    '.wc-events-toggle.monitoring:hover {',
    '  background: #38a169;',
    '}',
    '',
    '.wc-events-clear {',
    '  padding: 8px 16px;',
    '  background: #e2e8f0;',
    '  color: #2d3748;',
    '  border: none;',
    '  border-radius: 6px;',
    '  font-size: 14px;',
    '  font-weight: 500;',
    '  cursor: pointer;',
    '  transition: all 0.2s;',
    '}',
    '',
    '.wc-events-clear:hover {',
    '  background: #cbd5e0;',
    '}',
    '',
    '.wc-event-log {',
    '  background: #f7fafc;',
    '  border: 1px solid #e2e8f0;',
    '  border-radius: 8px;',
    '  padding: 12px;',
    '  margin-bottom: 8px;',
    '  font-size: 12px;',
    '  transition: all 0.2s ease;',
    '}',
    '',
    '.wc-event-log:hover {',
    '  border-color: #667eea;',
    '  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);',
    '}',
    '',
    '.wc-event-header {',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: space-between;',
    '  margin-bottom: 6px;',
    '}',
    '',
    '.wc-event-type {',
    '  font-weight: 600;',
    '  color: #667eea;',
    '  font-family: "Monaco", "Courier New", monospace;',
    '}',
    '',
    '.wc-event-timestamp {',
    '  color: #718096;',
    '  font-size: 11px;',
    '}',
    '',
    '.wc-event-source {',
    '  color: #805ad5;',
    '  font-weight: 500;',
    '  margin-bottom: 4px;',
    '}',
    '',
    '.wc-event-detail {',
    '  background: white;',
    '  padding: 8px;',
    '  border-radius: 4px;',
    '  border: 1px solid #e2e8f0;',
    '  color: #2d3748;',
    '  font-family: "Monaco", "Courier New", monospace;',
    '  white-space: pre-wrap;',
    '  word-break: break-word;',
    '  max-height: 200px;',
    '  overflow-y: auto;',
    '}',
    '',
    '.wc-no-events {',
    '  text-align: center;',
    '  color: #718096;',
    '  padding: 32px;',
    '}',
  ].join('\n');

  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);
}

function createButton(): HTMLButtonElement {
  const button = document.createElement('button');
  button.id = 'wc-devtools-btn';
  button.textContent = '⚡';
  button.title = 'Web Component Dev Tools';
  return button;
}

function createPanel(): HTMLDivElement {
  const panel = document.createElement('div');
  panel.id = 'wc-devtools-panel';

  const header = document.createElement('div');
  header.className = 'wc-devtools-header';

  const title = document.createElement('span');
  title.textContent = 'Web Components';
  header.appendChild(title);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'wc-devtools-close';
  closeBtn.textContent = '×';
  header.appendChild(closeBtn);

  // Tabs section
  const tabsSection = document.createElement('div');
  tabsSection.className = 'wc-devtools-tabs';

  const componentsTab = document.createElement('button');
  componentsTab.className = 'wc-devtools-tab active';
  componentsTab.textContent = 'Components';
  componentsTab.dataset.tab = 'components';
  tabsSection.appendChild(componentsTab);

  const eventsTab = document.createElement('button');
  eventsTab.className = 'wc-devtools-tab';
  eventsTab.textContent = 'Events';
  eventsTab.dataset.tab = 'events';
  tabsSection.appendChild(eventsTab);

  // Search bar section (only for components tab)
  const searchSection = document.createElement('div');
  searchSection.className = 'wc-devtools-search';
  searchSection.dataset.tabContent = 'components';

  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Filter by tag name...';
  searchInput.id = 'wc-devtools-search-input';
  searchInput.addEventListener('input', (e) => {
    searchFilter = (e.target as HTMLInputElement).value.toLowerCase().trim();
    updateComponentList();
  });

  searchSection.appendChild(searchInput);

  // Events controls section
  const eventsControls = document.createElement('div');
  eventsControls.className = 'wc-events-controls';
  eventsControls.dataset.tabContent = 'events';
  eventsControls.style.display = 'none';

  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'wc-events-toggle';
  toggleBtn.textContent = 'Start Monitoring';
  toggleBtn.id = 'wc-events-toggle';
  toggleBtn.addEventListener('click', toggleEventMonitoring);
  eventsControls.appendChild(toggleBtn);

  const clearBtn = document.createElement('button');
  clearBtn.className = 'wc-events-clear';
  clearBtn.textContent = 'Clear';
  clearBtn.addEventListener('click', clearEventLogs);
  eventsControls.appendChild(clearBtn);

  // Components content
  const componentsContent = document.createElement('div');
  componentsContent.className = 'wc-devtools-content wc-devtools-tab-content active';
  componentsContent.id = 'wc-devtools-content';
  componentsContent.dataset.tab = 'components';
  componentsContent.textContent = 'Loading...';

  // Events content
  const eventsContent = document.createElement('div');
  eventsContent.className = 'wc-devtools-content wc-devtools-tab-content';
  eventsContent.id = 'wc-devtools-events';
  eventsContent.dataset.tab = 'events';
  eventsContent.innerHTML = '<div class="wc-no-events">Start monitoring to see events</div>';

  panel.appendChild(header);
  panel.appendChild(tabsSection);
  panel.appendChild(searchSection);
  panel.appendChild(eventsControls);
  panel.appendChild(componentsContent);
  panel.appendChild(eventsContent);

  // Tab switching logic
  componentsTab.addEventListener('click', () => switchTab('components'));
  eventsTab.addEventListener('click', () => switchTab('events'));

  return panel;
}

function updatePanelPosition(button: HTMLButtonElement, panel: HTMLDivElement, hasButtonBeenDragged: boolean, initialPosition: string): void {
  const buttonRect = button.getBoundingClientRect();
  const panelWidth = 500;
  const maxPanelHeight = 700;
  const gap = 20; // Gap between button and panel
  const margin = 20; // Minimum margin from viewport edges
  
  // Use max height as estimate for positioning to avoid layout issues
  // The panel will naturally size itself with max-height constraint from CSS
  const panelHeight = maxPanelHeight;
  
  let left: number;
  let top: number;
  
  // If button hasn't been dragged, position panel above it based on initial position
  if (!hasButtonBeenDragged) {
    // Align panel based on initial button position
    if (initialPosition.includes('left')) {
      left = buttonRect.left;
    } else if (initialPosition.includes('right')) {
      left = buttonRect.right - panelWidth;
    } else {
      // Center align
      left = buttonRect.left + (buttonRect.width / 2) - (panelWidth / 2);
    }
    
    // Ensure left position doesn't go off screen
    left = Math.max(margin, Math.min(left, window.innerWidth - panelWidth - margin));
    
    // Try to position panel above the button first
    top = buttonRect.top - panelHeight - gap;
    
    // If panel would go above viewport, position below button instead
    if (top < margin) {
      top = buttonRect.bottom + gap;
      
      // Check if it would go below viewport when positioned below
      if (top + panelHeight + margin > window.innerHeight) {
        // Not enough space above or below - position it in the best available spot
        const spaceAbove = buttonRect.top - margin;
        const spaceBelow = window.innerHeight - buttonRect.bottom - margin;
        
        if (spaceAbove > spaceBelow) {
          // More space above - position at top with margin
          top = margin;
        } else {
          // More space below - position at bottom with margin
          top = window.innerHeight - panelHeight - margin;
        }
      }
    }
  } else {
    // Button has been dragged - use smart positioning
    // Determine best position based on button location
    const spaceRight = window.innerWidth - buttonRect.right;
    const spaceLeft = buttonRect.left;
    const spaceBottom = window.innerHeight - buttonRect.bottom;
    const spaceTop = buttonRect.top;
    
    // Try to position panel to the right or left of button first
    if (spaceRight >= panelWidth + gap + margin) {
      // Position to the right
      left = buttonRect.right + gap;
      top = Math.max(margin, Math.min(buttonRect.top, window.innerHeight - panelHeight - margin));
    } else if (spaceLeft >= panelWidth + gap + margin) {
      // Position to the left
      left = buttonRect.left - panelWidth - gap;
      top = Math.max(margin, Math.min(buttonRect.top, window.innerHeight - panelHeight - margin));
    } else if (spaceBottom >= panelHeight + gap + margin) {
      // Position below
      left = Math.max(margin, Math.min(buttonRect.left, window.innerWidth - panelWidth - margin));
      top = buttonRect.bottom + gap;
    } else if (spaceTop >= panelHeight + gap + margin) {
      // Position above
      left = Math.max(margin, Math.min(buttonRect.left, window.innerWidth - panelWidth - margin));
      top = buttonRect.top - panelHeight - gap;
    } else {
      // Not enough space anywhere - center on screen and constrain
      left = (window.innerWidth - panelWidth) / 2;
      top = (window.innerHeight - panelHeight) / 2;
    }
  }
  
  // Final constraints to ensure panel stays within viewport
  left = Math.max(margin, Math.min(left, window.innerWidth - panelWidth - margin));
  top = Math.max(margin, Math.min(top, window.innerHeight - panelHeight - margin));
  
  panel.style.left = `${left}px`;
  panel.style.top = `${top}px`;
  panel.style.right = 'auto';
  panel.style.bottom = 'auto';
}

function setupEventListeners(button: HTMLButtonElement, panel: HTMLDivElement, initialPosition: string): void {
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let initialX = 0;
  let initialY = 0;
  let hasMoved = false;
  let hasButtonBeenDragged = false;

  button.addEventListener('mousedown', (e) => {
    isDragging = true;
    hasMoved = false;
    startX = e.clientX;
    startY = e.clientY;
    
    const rect = button.getBoundingClientRect();
    initialX = rect.left;
    initialY = rect.top;
    
    // Prevent text selection while dragging
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    
    // Consider it a drag if moved more than 5 pixels
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      hasMoved = true;
    }
    
    if (hasMoved) {
      hasButtonBeenDragged = true;
      const newX = initialX + deltaX;
      const newY = initialY + deltaY;
      
      // Constrain to viewport
      const maxX = window.innerWidth - button.offsetWidth;
      const maxY = window.innerHeight - button.offsetHeight;
      
      const constrainedX = Math.max(0, Math.min(newX, maxX));
      const constrainedY = Math.max(0, Math.min(newY, maxY));
      
      button.style.left = `${constrainedX}px`;
      button.style.top = `${constrainedY}px`;
      button.style.right = 'auto';
      button.style.bottom = 'auto';
      
      // Update panel position to follow button
      updatePanelPosition(button, panel, hasButtonBeenDragged, initialPosition);
    }
  });

  document.addEventListener('mouseup', () => {
    if (isDragging && !hasMoved) {
      // It was a click, not a drag
      const isVisible = panel.classList.toggle('visible');
      if (isVisible) {
        updatePanelPosition(button, panel, hasButtonBeenDragged, initialPosition);
        updateComponentList();
      }
    }
    isDragging = false;
  });

  const closeBtn = panel.querySelector('.wc-devtools-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      panel.classList.remove('visible');
    });
  }
}

function switchTab(tabName: string): void {
  // Update tab buttons
  const tabs = document.querySelectorAll('.wc-devtools-tab');
  tabs.forEach(tab => {
    const button = tab as HTMLButtonElement;
    if (button.dataset.tab === tabName) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });

  // Update tab content
  const contents = document.querySelectorAll('.wc-devtools-tab-content');
  contents.forEach(content => {
    const div = content as HTMLDivElement;
    if (div.dataset.tab === tabName) {
      div.classList.add('active');
    } else {
      div.classList.remove('active');
    }
  });

  // Update controls visibility
  const allControls = document.querySelectorAll('[data-tab-content]');
  allControls.forEach(control => {
    const div = control as HTMLDivElement;
    if (div.dataset.tabContent === tabName) {
      div.style.display = '';
    } else {
      div.style.display = 'none';
    }
  });

  // Refresh content when switching to events tab
  if (tabName === 'events') {
    updateEventsList();
  }
}

function setupEventMonitoring(): void {
  // This will be called when monitoring is enabled
  // We'll track all custom elements and their events
}

function toggleEventMonitoring(): void {
  isEventMonitoringEnabled = !isEventMonitoringEnabled;
  
  const toggleBtn = document.getElementById('wc-events-toggle');
  if (!toggleBtn) return;

  if (isEventMonitoringEnabled) {
    toggleBtn.textContent = 'Stop Monitoring';
    toggleBtn.classList.add('monitoring');
    startMonitoring();
  } else {
    toggleBtn.textContent = 'Start Monitoring';
    toggleBtn.classList.remove('monitoring');
    stopMonitoring();
  }
  
  updateEventsList();
}

function startMonitoring(): void {
  const instances = scanWebComponents();
  
  instances.forEach(instance => {
    const element = instance.element;
    
    // Get all event names from the element's prototype
    const eventNames = getCustomEventNames(element);
    
    // Also listen for common custom events
    const commonEvents = ['change', 'input', 'click', 'submit', 'close', 'open', 'load', 'error'];
    const allEvents = new Set([...eventNames, ...commonEvents]);
    
    const listenersMap = new Map<string, EventListener>();
    
    allEvents.forEach(eventName => {
      const listener = (event: Event) => {
        const customEvent = event as CustomEvent;
        eventLogs.unshift({
          timestamp: Date.now(),
          eventType: event.type,
          tagName: element.tagName.toLowerCase(),
          element: element,
          detail: customEvent.detail
        });
        
        // Keep only the last MAX_EVENT_LOGS events
        if (eventLogs.length > MAX_EVENT_LOGS) {
          eventLogs.splice(MAX_EVENT_LOGS);
        }
        
        // Update the events list if the events tab is active
        const eventsContent = document.getElementById('wc-devtools-events');
        if (eventsContent && eventsContent.classList.contains('active')) {
          updateEventsList();
        }
      };
      
      element.addEventListener(eventName, listener);
      listenersMap.set(eventName, listener);
    });
    
    eventListeners.set(element, listenersMap);
  });
}

function stopMonitoring(): void {
  // Remove all event listeners
  eventListeners.forEach((listenersMap, element) => {
    listenersMap.forEach((listener, eventName) => {
      element.removeEventListener(eventName, listener);
    });
  });
  
  eventListeners.clear();
}

function getCustomEventNames(element: Element): string[] {
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

function clearEventLogs(): void {
  eventLogs.length = 0;
  updateEventsList();
}

function updateEventsList(): void {
  const eventsContent = document.getElementById('wc-devtools-events');
  if (!eventsContent) return;
  
  eventsContent.innerHTML = '';
  
  if (eventLogs.length === 0) {
    const noEvents = document.createElement('div');
    noEvents.className = 'wc-no-events';
    noEvents.textContent = isEventMonitoringEnabled 
      ? 'No events captured yet' 
      : 'Start monitoring to see events';
    eventsContent.appendChild(noEvents);
    return;
  }
  
  eventLogs.forEach(log => {
    const logDiv = document.createElement('div');
    logDiv.className = 'wc-event-log';
    
    const header = document.createElement('div');
    header.className = 'wc-event-header';
    
    const eventType = document.createElement('span');
    eventType.className = 'wc-event-type';
    eventType.textContent = log.eventType;
    header.appendChild(eventType);
    
    const timestamp = document.createElement('span');
    timestamp.className = 'wc-event-timestamp';
    timestamp.textContent = formatTimestamp(log.timestamp);
    header.appendChild(timestamp);
    
    logDiv.appendChild(header);
    
    const source = document.createElement('div');
    source.className = 'wc-event-source';
    source.textContent = `<${log.tagName}>`;
    logDiv.appendChild(source);
    
    if (log.detail !== undefined && log.detail !== null) {
      const detail = document.createElement('div');
      detail.className = 'wc-event-detail';
      detail.textContent = formatEventDetail(log.detail);
      logDiv.appendChild(detail);
    }
    
    // Add hover effect to highlight element
    logDiv.addEventListener('mouseenter', () => {
      if (document.body.contains(log.element)) {
        highlightElement(log.element);
      }
    });
    
    logDiv.addEventListener('mouseleave', () => {
      if (document.body.contains(log.element)) {
        unhighlightElement(log.element);
      }
    });
    
    // Click to scroll to element
    logDiv.addEventListener('click', () => {
      if (document.body.contains(log.element)) {
        log.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        highlightElement(log.element);
        setTimeout(() => {
          unhighlightElement(log.element);
        }, 3000);
      }
    });
    
    logDiv.style.cursor = 'pointer';
    
    eventsContent.appendChild(logDiv);
  });
}

function formatTimestamp(timestamp: number): string {
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

function formatEventDetail(detail: unknown): string {
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

function scanWebComponents(): InstanceInfo[] {
    const instances: InstanceInfo[] = [];

    // Use TreeWalker for efficient DOM traversal - only visits element nodes
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: (node) => {
          // Filter for custom elements (contains hyphen)
          return (node as Element).nodeName.includes('-')
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_SKIP;
        },
      }
    );

    let node: Node | null;
    while ((node = walker.nextNode())) {
      const element = node as Element;
      const tagName = element.nodeName.toLowerCase();

      const instanceInfo: InstanceInfo = {
        element,
        tagName,
        attributes: new Map<string, string | null>(),
        properties: new Map<string, unknown>(),
        methods: [],
        slots: new Map<string, boolean>(),
      };

      // Collect attributes with their values
      const attrs = element.attributes;
      for (let i = 0; i < attrs.length; i++) {
        const attrName = attrs[i].name;
        const attrValue = attrs[i].value;
        instanceInfo.attributes.set(attrName, attrValue);
      }

      // Collect properties (from the element instance)
      const elementAsAny = element as any;
      
      // Get properties from the element's prototype chain
      const proto = Object.getPrototypeOf(element);
      if (proto && proto !== HTMLElement.prototype) {
        const descriptors = Object.getOwnPropertyDescriptors(proto);
        
        for (const propName in descriptors) {
          const descriptor = descriptors[propName];
          
          // Skip private properties (starting with _), constructor, and standard HTMLElement methods
          if (propName.startsWith('_') || 
              propName === 'constructor' ||
              propName in HTMLElement.prototype) {
            continue;
          }

          // If it has a getter, it's a property
          if (descriptor.get) {
            try {
              const value = elementAsAny[propName];
              instanceInfo.properties.set(propName, value);
            } catch (e) {
              // Skip properties that throw errors
            }
          }
          
          // If it's a function and not a property accessor, it's a method
          if (typeof descriptor.value === 'function' && !descriptor.get && !descriptor.set) {
            instanceInfo.methods.push(propName);
          }
        }
      }

      // Collect slots from shadow DOM
      if (element.shadowRoot) {
        const slots = element.shadowRoot.querySelectorAll('slot');
        slots.forEach((slot) => {
          const slotName = slot.getAttribute('name') || 'default';
          const assignedNodes = slot.assignedNodes();
          const hasContent = assignedNodes.length > 0;
          instanceInfo.slots.set(slotName, hasContent);
        });
      }

      instances.push(instanceInfo);
    }

  return instances;
}

function updateComponentList(): void {
  const content = document.getElementById('wc-devtools-content');
  if (!content || isUpdating) return;

  isUpdating = true;

  const instances = scanWebComponents();

  // Apply search filter
  const filteredInstances = searchFilter
    ? instances.filter(inst => inst.tagName.includes(searchFilter))
    : instances;

  content.innerHTML = '';

  if (instances.length === 0) {
    const noComponents = document.createElement('div');
    noComponents.className = 'wc-no-components';
    noComponents.textContent = 'No web components found on this page.';
    content.appendChild(noComponents);
    isUpdating = false;
    return;
  }

  if (filteredInstances.length === 0) {
    const noComponents = document.createElement('div');
    noComponents.className = 'wc-no-components';
    noComponents.textContent = `No components matching "${searchFilter}".`;
    content.appendChild(noComponents);
    isUpdating = false;
    return;
  }

  // Count unique component types in filtered results
  const componentTypes = new Set(filteredInstances.map(inst => inst.tagName));

  const stats = createStatsElement(componentTypes.size, filteredInstances.length);
  content.appendChild(stats);

  filteredInstances.forEach((instance, index) => {
    const instanceEl = createInstanceElement(instance, index + 1);
    content.appendChild(instanceEl);
  });

  isUpdating = false;
}

function createStatsElement(uniqueCount: number, totalCount: number): HTMLDivElement {
  const stats = document.createElement('div');
  stats.className = 'wc-stats';

  const uniqueLabel = document.createElement('strong');
  uniqueLabel.textContent = String(uniqueCount);
  stats.appendChild(uniqueLabel);

  stats.appendChild(document.createTextNode(' unique component'));
  if (uniqueCount !== 1) {
    stats.appendChild(document.createTextNode('s'));
  }
  stats.appendChild(document.createTextNode(' • '));

  const totalLabel = document.createElement('strong');
  totalLabel.textContent = String(totalCount);
  stats.appendChild(totalLabel);

  stats.appendChild(document.createTextNode(' total instance'));
  if (totalCount !== 1) {
    stats.appendChild(document.createTextNode('s'));
  }

  return stats;
}

function createInstanceElement(instance: InstanceInfo, index: number): HTMLDivElement {
  const instanceDiv = document.createElement('div');
  const isExpanded = expandedStates.get(instance.element) || false;
  instanceDiv.className = isExpanded ? 'wc-component expanded' : 'wc-component';

  // Header with component name and instance number
  const header = document.createElement('div');
  header.className = 'wc-instance-header';

  const nameAndIndex = document.createElement('div');
  nameAndIndex.className = 'wc-component-name';
  
  const indexBadge = document.createElement('span');
  indexBadge.className = 'wc-instance-badge';
  indexBadge.textContent = `#${index}`;
  nameAndIndex.appendChild(indexBadge);
  
  nameAndIndex.appendChild(document.createTextNode(` <${instance.tagName}>`));
  
  header.appendChild(nameAndIndex);

  // Add locate button
  const locateBtn = document.createElement('button');
  locateBtn.className = 'wc-locate-btn';
  locateBtn.title = 'Scroll to element in page';
  locateBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  `;
  locateBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    instance.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // Flash highlight
    highlightElement(instance.element);
    setTimeout(() => {
      unhighlightElement(instance.element);
    }, 3000);
  });
  header.appendChild(locateBtn);

  // Add expand/collapse indicator
  const expandIndicator = document.createElement('span');
  expandIndicator.className = 'wc-expand-indicator';
  expandIndicator.textContent = '▶';
  header.appendChild(expandIndicator);

  instanceDiv.appendChild(header);

  // Create details container
  const detailsContainer = document.createElement('div');
  detailsContainer.className = 'wc-component-details';

  // Add hover effect to highlight element in page
  instanceDiv.addEventListener('mouseenter', () => {
    highlightElement(instance.element);
  });

  instanceDiv.addEventListener('mouseleave', () => {
    unhighlightElement(instance.element);
  });

  // Toggle expand/collapse on header click only
  header.style.cursor = 'pointer';
  header.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    const newExpandedState = !expandedStates.get(instance.element);
    expandedStates.set(instance.element, newExpandedState);
    instanceDiv.classList.toggle('expanded');
  });

  // Prevent clicks on details from bubbling up
  detailsContainer.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // Scroll to element on double-click of the header
  header.addEventListener('dblclick', (e) => {
    e.stopPropagation();
    e.preventDefault();
    instance.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  // Attributes Section
  if (instance.attributes.size > 0) {
    const attributesSection = document.createElement('div');
    attributesSection.className = 'wc-section';

    const attrTitle = document.createElement('div');
    attrTitle.className = 'wc-section-title';
    attrTitle.textContent = 'Attributes';
    attributesSection.appendChild(attrTitle);

    const attributesDiv = document.createElement('div');
    attributesDiv.className = 'wc-component-attributes';

    instance.attributes.forEach((value, attrName) => {
      const attrSpan = document.createElement('span');
      attrSpan.className = 'wc-attribute';

      const attrNameSpan = document.createElement('span');
      attrNameSpan.className = 'wc-attribute-name';
      attrNameSpan.textContent = attrName;
      attrSpan.appendChild(attrNameSpan);

      if (value !== null && value !== '') {
        attrSpan.appendChild(document.createTextNode('="'));
        const attrValueSpan = document.createElement('span');
        attrValueSpan.className = 'wc-attribute-value';
        attrValueSpan.textContent = value;
        attrSpan.appendChild(attrValueSpan);
        attrSpan.appendChild(document.createTextNode('"'));
      }

      attributesDiv.appendChild(attrSpan);
    });

    attributesSection.appendChild(attributesDiv);
    detailsContainer.appendChild(attributesSection);
  }

  // Properties Section
  if (instance.properties.size > 0) {
    const propertiesSection = document.createElement('div');
    propertiesSection.className = 'wc-section';

    const propTitle = document.createElement('div');
    propTitle.className = 'wc-section-title';
    propTitle.textContent = 'Properties';
    propertiesSection.appendChild(propTitle);

    instance.properties.forEach((value, propName) => {
      const propDiv = document.createElement('div');
      propDiv.className = 'wc-property';

      const propNameSpan = document.createElement('span');
      propNameSpan.className = 'wc-property-name';
      propNameSpan.textContent = propName;
      propDiv.appendChild(propNameSpan);

      propDiv.appendChild(document.createTextNode(': '));

      const propValueSpan = document.createElement('span');
      propValueSpan.className = 'wc-property-value';
      propValueSpan.textContent = formatPropertyValue(value);
      propDiv.appendChild(propValueSpan);

      propDiv.appendChild(document.createTextNode(' '));

      const propTypeSpan = document.createElement('span');
      propTypeSpan.className = 'wc-property-type';
      propTypeSpan.textContent = `(${getValueType(value)})`;
      propDiv.appendChild(propTypeSpan);

      propertiesSection.appendChild(propDiv);
    });

    detailsContainer.appendChild(propertiesSection);
  }

  // Methods Section
  if (instance.methods.length > 0) {
    const methodsSection = document.createElement('div');
    methodsSection.className = 'wc-section';

    const methodTitle = document.createElement('div');
    methodTitle.className = 'wc-section-title';
    methodTitle.textContent = 'Public Methods';
    methodsSection.appendChild(methodTitle);

    const methodsDiv = document.createElement('div');

    instance.methods.sort().forEach((methodName) => {
      const methodSpan = document.createElement('span');
      methodSpan.className = 'wc-method';

      const methodNameSpan = document.createElement('span');
      methodNameSpan.className = 'wc-method-name';
      methodNameSpan.textContent = `${methodName}()`;
      methodSpan.appendChild(methodNameSpan);

      methodsDiv.appendChild(methodSpan);
    });

    methodsSection.appendChild(methodsDiv);
    detailsContainer.appendChild(methodsSection);
  }

  // Slots Section
  if (instance.slots.size > 0) {
    const slotsSection = document.createElement('div');
    slotsSection.className = 'wc-section';

    const slotTitle = document.createElement('div');
    slotTitle.className = 'wc-section-title';
    slotTitle.textContent = 'Slots';
    slotsSection.appendChild(slotTitle);

    const slotsDiv = document.createElement('div');

    instance.slots.forEach((hasContent, slotName) => {
      const slotSpan = document.createElement('span');
      slotSpan.className = hasContent ? 'wc-slot has-content' : 'wc-slot';

      const slotNameSpan = document.createElement('span');
      slotNameSpan.className = 'wc-slot-name';
      slotNameSpan.textContent = slotName === 'default' ? '<slot>' : `<slot name="${slotName}">`;
      slotSpan.appendChild(slotNameSpan);

      slotSpan.appendChild(document.createTextNode(' '));

      const slotStatusSpan = document.createElement('span');
      slotStatusSpan.className = 'wc-slot-status';
      slotStatusSpan.textContent = hasContent ? '(has content)' : '(empty)';
      slotSpan.appendChild(slotStatusSpan);

      slotsDiv.appendChild(slotSpan);
    });

    slotsSection.appendChild(slotsDiv);
    detailsContainer.appendChild(slotsSection);
  }

  instanceDiv.appendChild(detailsContainer);

  return instanceDiv;
}

function formatPropertyValue(value: unknown): string {
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

function getValueType(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

function highlightElement(element: Element): void {
  element.classList.add('wc-element-highlight');
}

function unhighlightElement(element: Element): void {
  element.classList.remove('wc-element-highlight');
}

function watchForChanges(panel: HTMLDivElement): void {
  let updateTimeout: ReturnType<typeof setTimeout>;
  const observer = new MutationObserver((mutations) => {
    // Don't process mutations if we're currently updating
    if (isUpdating) {
      return;
    }

    // Only update if the panel is visible
    if (!panel.classList.contains('visible')) {
      return;
    }

    // Check if any mutations affect custom elements (contain hyphen in tag name)
    const hasCustomElementChanges = mutations.some(mutation => {
      // Ignore mutations inside the devtools panel itself
      if (mutation.target === panel || panel.contains(mutation.target as Node)) {
        return false;
      }

      // Ignore mutations to the devtools button or panel
      const target = mutation.target as Element;
      if (target.id === 'wc-devtools-btn' || target.id === 'wc-devtools-panel') {
        return false;
      }

      // Ignore if mutation target is inside devtools content
      const devtoolsContent = document.getElementById('wc-devtools-content');
      if (devtoolsContent && (mutation.target === devtoolsContent || devtoolsContent.contains(mutation.target as Node))) {
        return false;
      }

      // Check added nodes
      if (mutation.addedNodes.length > 0) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            // Check if it's a custom element or contains custom elements
            if (element.nodeName.includes('-') || element.querySelector('[is], *[is], *')) {
              return true;
            }
          }
        }
      }
      
      // Check removed nodes
      if (mutation.removedNodes.length > 0) {
        for (const node of mutation.removedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            if (element.nodeName.includes('-')) {
              return true;
            }
          }
        }
      }
      
      return false;
    });

    // Only update if there were actual changes to custom elements
    if (hasCustomElementChanges) {
      clearTimeout(updateTimeout);
      updateTimeout = setTimeout(() => {
        updateComponentList();
      }, 300);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false,
  });
}

function getPositionStyles(position: string, isPanel: boolean = false): string {
  const offset = isPanel ? '70px' : '20px';

  switch (position) {
    case 'top-left':
      return isPanel ? `top: ${offset}; left: 20px;` : `top: 20px; left: 20px;`;
    case 'top-right':
      return isPanel ? `top: ${offset}; right: 20px;` : `top: 20px; right: 20px;`;
    case 'bottom-left':
      return isPanel ? `bottom: ${offset}; left: 20px;` : `bottom: 20px; left: 20px;`;
    case 'bottom-right':
    default:
      return isPanel ? `bottom: ${offset}; right: 20px;` : `bottom: 20px; right: 20px;`;
  }
}

// Auto-initialize if config is provided via global
declare global {
  interface Window {
    __WC_DEVTOOLS_CONFIG__?: DevToolsConfig;
  }
}

if (typeof window !== 'undefined' && window.__WC_DEVTOOLS_CONFIG__) {
  initDevTools(window.__WC_DEVTOOLS_CONFIG__);
}
