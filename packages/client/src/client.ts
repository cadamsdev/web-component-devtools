// Web Component Dev Tools Client Script
// This script is injected into the page to provide debugging tools for web components

import type { DevToolsConfig } from './types';
import { injectStyles } from './styles';
import { 
  createButton, 
  createPanel, 
  createStatsElement, 
  createInstanceElement,
  createEventLogElement,
  updateUndoRedoButtons
} from './ui';
import { scanWebComponents } from './scanner';
import { EventMonitor } from './event-monitor';
import { UndoManager } from './undo-manager';
import { PropertyEditor } from './property-editor';
import { RenderTracker } from './render-tracker';
import { RenderOverlay } from './render-overlay';

// Track expanded state separately to persist across re-renders
const expandedStates = new Map<Element, boolean>();

// Map from element to its UI component div
const elementToUIMap = new WeakMap<Element, HTMLDivElement>();

// Track if we're currently updating to avoid recursive updates
let isUpdating = false;

// Track the current search filter
let searchFilter = '';

// Event monitor instance
const eventMonitor = new EventMonitor();

// Undo manager instance
const undoManager = new UndoManager();

// Property editor instance
const propertyEditor = new PropertyEditor(undoManager);

// Render tracker instance
const renderTracker = new RenderTracker();

// Render overlay instance
const renderOverlay = new RenderOverlay();

// Connect render tracker to overlay
renderTracker.setOverlay(renderOverlay);

export function initDevTools(config: DevToolsConfig) {
  const { position } = config;

  injectStyles(position);

  const button = createButton();
  const panel = createPanel(
    handleSearch,
    handleTabSwitch,
    handleToggleMonitoring,
    handleClearEvents,
    handleUndo,
    handleRedo,
    handleToggleRenderTracking,
    handleToggleRenderOverlay
  );

  document.body.appendChild(button);
  document.body.appendChild(panel);

  setupEventListeners(button, panel, position);
  watchForChanges(panel);
  
  // Set up event monitor callback
  eventMonitor.setUpdateCallback(updateEventsList);
  
  // Set up undo manager callback
  undoManager.setOnChangeCallback(() => {
    updateUndoRedoButtons(undoManager.canUndo(), undoManager.canRedo());
  });
  
  // Set up render tracker callback to update UI when render count changes
  renderTracker.setOnRenderCallback((element, count) => {
    updateRenderCountBadge(element, count);
  });
  
  // Initialize undo/redo button states
  updateUndoRedoButtons(undoManager.canUndo(), undoManager.canRedo());
  
  // Set up keyboard shortcuts
  setupKeyboardShortcuts();
}

function handleSearch(value: string): void {
  searchFilter = value;
  updateComponentList();
}

function handleTabSwitch(tabName: string): void {
  switchTab(tabName);
}

function handleToggleMonitoring(): void {
  eventMonitor.toggle();
  
  const toggleBtn = document.getElementById('wc-events-toggle');
  if (!toggleBtn) return;

  if (eventMonitor.isEnabled()) {
    toggleBtn.textContent = 'Stop Monitoring';
    toggleBtn.classList.add('monitoring');
  } else {
    toggleBtn.textContent = 'Start Monitoring';
    toggleBtn.classList.remove('monitoring');
  }
  
  updateEventsList();
}

function handleClearEvents(): void {
  eventMonitor.clearLogs();
}

function handleUndo(): void {
  if (undoManager.undo()) {
    updateComponentList();
  }
}

function handleRedo(): void {
  if (undoManager.redo()) {
    updateComponentList();
  }
}

function handleToggleRenderTracking(): void {
  renderTracker.toggle();
  
  const toggleBtn = document.getElementById('wc-render-tracking-toggle');
  if (!toggleBtn) return;

  if (renderTracker.isEnabled()) {
    toggleBtn.classList.add('active');
    toggleBtn.title = 'Disable render count tracking';
  } else {
    toggleBtn.classList.remove('active');
    toggleBtn.title = 'Enable render count tracking';
  }
  
  updateComponentList();
}

function handleToggleRenderOverlay(): void {
  renderOverlay.toggle();
  
  const toggleBtn = document.getElementById('wc-render-overlay-toggle');
  if (!toggleBtn) return;

  if (renderOverlay.isEnabled()) {
    toggleBtn.classList.add('active');
    toggleBtn.title = 'Hide render counts on page';
    
    // Update all overlays with current render counts if tracking is enabled
    if (renderTracker.isEnabled()) {
      const instances = scanWebComponents(renderTracker);
      instances.forEach(instance => {
        if (instance.renderCount && instance.renderCount > 0) {
          renderOverlay.updateOverlay(instance.element, instance.renderCount);
        }
      });
    }
  } else {
    toggleBtn.classList.remove('active');
    toggleBtn.title = 'Show render counts on page';
    renderOverlay.clearAll();
  }
}

function setupKeyboardShortcuts(): void {
  document.addEventListener('keydown', (e) => {
    // Only handle shortcuts when the panel is visible
    const panel = document.getElementById('wc-devtools-panel');
    if (!panel || !panel.classList.contains('visible')) {
      return;
    }

    // Check if we're in an input or textarea
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      // Allow shortcuts even when in input, but don't let them propagate to the page
      e.stopPropagation();
    }

    // Undo: Ctrl+Z or Cmd+Z
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      handleUndo();
    }

    // Redo: Ctrl+Y or Cmd+Y or Ctrl+Shift+Z or Cmd+Shift+Z
    if (((e.ctrlKey || e.metaKey) && e.key === 'y') || 
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')) {
      e.preventDefault();
      handleRedo();
    }
  });
}

function updatePanelPosition(
  button: HTMLButtonElement, 
  panel: HTMLDivElement, 
  hasButtonBeenDragged: boolean, 
  initialPosition: string
): void {
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

function setupEventListeners(
  button: HTMLButtonElement, 
  panel: HTMLDivElement, 
  initialPosition: string
): void {
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

function updateEventsList(): void {
  const eventsContent = document.getElementById('wc-devtools-events');
  if (!eventsContent) return;
  
  eventsContent.innerHTML = '';
  
  const eventLogs = eventMonitor.getEventLogs();
  
  if (eventLogs.length === 0) {
    const noEvents = document.createElement('div');
    noEvents.className = 'wc-no-events';
    noEvents.textContent = eventMonitor.isEnabled() 
      ? 'No events captured yet' 
      : 'Start monitoring to see events';
    eventsContent.appendChild(noEvents);
    return;
  }
  
  eventLogs.forEach(log => {
    const logElement = createEventLogElement(log);
    eventsContent.appendChild(logElement);
  });
}

function updateComponentList(): void {
  const content = document.getElementById('wc-devtools-content');
  if (!content || isUpdating) return;

  isUpdating = true;

  const instances = scanWebComponents(renderTracker);

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
    const instanceEl = createInstanceElement(
      instance, 
      index + 1, 
      expandedStates,
      propertyEditor,
      updateComponentList
    );
    content.appendChild(instanceEl);
    
    // Store mapping from element to UI component
    elementToUIMap.set(instance.element, instanceEl);
  });

  isUpdating = false;
}

/**
 * Update the render count badge for a specific element in the UI
 */
function updateRenderCountBadge(element: Element, count: number): void {
  // Don't update if the panel is not visible
  const panel = document.getElementById('wc-devtools-panel');
  if (!panel || !panel.classList.contains('visible')) {
    return;
  }
  
  // Get the UI component div for this element
  const instanceDiv = elementToUIMap.get(element);
  if (!instanceDiv) return;
  
  // Find the component name element
  const nameElement = instanceDiv.querySelector('.wc-component-name');
  if (!nameElement) return;
  
  // Find or create the render count badge
  let badge = nameElement.querySelector('.wc-render-count-badge') as HTMLSpanElement;
  
  if (!badge) {
    // Create new badge if it doesn't exist
    badge = document.createElement('span');
    badge.className = 'wc-render-count-badge';
    nameElement.appendChild(badge);
  }
  
  // Update the badge text and title
  badge.textContent = `${count} render${count !== 1 ? 's' : ''}`;
  badge.title = `This component has re-rendered ${count} time${count !== 1 ? 's' : ''}`;
  
  // Add a flash animation to indicate update
  badge.classList.add('wc-render-count-flash');
  setTimeout(() => {
    badge?.classList.remove('wc-render-count-flash');
  }, 500);
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

// Auto-initialize if config is provided via global
declare global {
  interface Window {
    __WC_DEVTOOLS_CONFIG__?: DevToolsConfig;
  }
}

if (typeof window !== 'undefined' && window.__WC_DEVTOOLS_CONFIG__) {
  initDevTools(window.__WC_DEVTOOLS_CONFIG__);
}
