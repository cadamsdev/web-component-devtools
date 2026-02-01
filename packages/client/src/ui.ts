// UI components for Web Component Dev Tools

import type { InstanceInfo, ShadowDOMInfo, ShadowDOMNode, SlotAssignment, CSSVariableInfo } from './types';
import { 
  highlightElement, 
  unhighlightElement, 
  formatPropertyValue, 
  getValueType,
  formatTimestamp,
  formatEventDetail 
} from './utils';
import type { EventLog } from './types';
import { PropertyEditor } from './property-editor';
import { updateCSSVariable } from './css-variable-tracker';

export function createButton(): HTMLButtonElement {
  const button = document.createElement('button');
  button.id = 'wc-devtools-btn';
  button.textContent = '⚡';
  button.title = 'Web Component Dev Tools';
  return button;
}

export function createPanel(
  onSearch: (value: string) => void,
  onTabSwitch: (tabName: string) => void,
  onToggleMonitoring: () => void,
  onClearEvents: () => void,
  onUndo?: () => void,
  onRedo?: () => void,
  onToggleRenderTracking?: () => void,
  onToggleRenderOverlay?: () => void
): HTMLDivElement {
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
    const value = (e.target as HTMLInputElement).value.toLowerCase().trim();
    onSearch(value);
  });

  searchSection.appendChild(searchInput);

  // Undo/Redo controls (only for components tab)
  const undoRedoControls = document.createElement('div');
  undoRedoControls.className = 'wc-undo-redo-controls';
  undoRedoControls.dataset.tabContent = 'components';

  const undoBtn = document.createElement('button');
  undoBtn.className = 'wc-undo-btn';
  undoBtn.title = 'Undo (Ctrl+Z)';
  undoBtn.id = 'wc-undo-btn';
  undoBtn.disabled = true;
  undoBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M3 7v6h6"/>
      <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"/>
    </svg>
  `;
  if (onUndo) {
    undoBtn.addEventListener('click', onUndo);
  }
  undoRedoControls.appendChild(undoBtn);

  const redoBtn = document.createElement('button');
  redoBtn.className = 'wc-redo-btn';
  redoBtn.title = 'Redo (Ctrl+Y)';
  redoBtn.id = 'wc-redo-btn';
  redoBtn.disabled = true;
  redoBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 7v6h-6"/>
      <path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7"/>
    </svg>
  `;
  if (onRedo) {
    redoBtn.addEventListener('click', onRedo);
  }
  undoRedoControls.appendChild(redoBtn);

  // Add render tracking toggle
  const renderTrackingToggle = document.createElement('button');
  renderTrackingToggle.className = 'wc-render-tracking-toggle';
  renderTrackingToggle.title = 'Toggle render count tracking';
  renderTrackingToggle.id = 'wc-render-tracking-toggle';
  renderTrackingToggle.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <text x="12" y="16" text-anchor="middle" font-size="10" fill="currentColor" stroke="none">#</text>
    </svg>
  `;
  if (onToggleRenderTracking) {
    renderTrackingToggle.addEventListener('click', onToggleRenderTracking);
  }
  undoRedoControls.appendChild(renderTrackingToggle);

  // Add render overlay toggle (show counts on page)
  const renderOverlayToggle = document.createElement('button');
  renderOverlayToggle.className = 'wc-render-overlay-toggle';
  renderOverlayToggle.title = 'Show render counts on page';
  renderOverlayToggle.id = 'wc-render-overlay-toggle';
  renderOverlayToggle.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <circle cx="18" cy="6" r="3" fill="currentColor"/>
      <text x="18" y="8" text-anchor="middle" font-size="6" fill="white" stroke="none">#</text>
    </svg>
  `;
  if (onToggleRenderOverlay) {
    renderOverlayToggle.addEventListener('click', onToggleRenderOverlay);
  }
  undoRedoControls.appendChild(renderOverlayToggle);

  searchSection.appendChild(undoRedoControls);

  // Events controls section
  const eventsControls = document.createElement('div');
  eventsControls.className = 'wc-events-controls';
  eventsControls.dataset.tabContent = 'events';
  eventsControls.style.display = 'none';

  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'wc-events-toggle';
  toggleBtn.textContent = 'Start Monitoring';
  toggleBtn.id = 'wc-events-toggle';
  toggleBtn.addEventListener('click', onToggleMonitoring);
  eventsControls.appendChild(toggleBtn);

  const clearBtn = document.createElement('button');
  clearBtn.className = 'wc-events-clear';
  clearBtn.textContent = 'Clear';
  clearBtn.addEventListener('click', onClearEvents);
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
  componentsTab.addEventListener('click', () => onTabSwitch('components'));
  eventsTab.addEventListener('click', () => onTabSwitch('events'));

  return panel;
}

export function createStatsElement(uniqueCount: number, totalCount: number): HTMLDivElement {
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

export function createInstanceElement(
  instance: InstanceInfo, 
  index: number, 
  expandedStates: Map<Element, boolean>,
  propertyEditor?: PropertyEditor,
  onUpdate?: () => void
): HTMLDivElement {
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
  
  // Add render count badge if available
  if (instance.renderCount !== undefined && instance.renderCount > 0) {
    const renderBadge = document.createElement('span');
    renderBadge.className = 'wc-render-count-badge';
    renderBadge.textContent = `${instance.renderCount} render${instance.renderCount !== 1 ? 's' : ''}`;
    renderBadge.title = `This component has re-rendered ${instance.renderCount} time${instance.renderCount !== 1 ? 's' : ''}`;
    nameAndIndex.appendChild(renderBadge);
  }
  
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
      const attrRow = createEditableAttribute(
        instance.element,
        attrName,
        value,
        propertyEditor,
        onUpdate
      );
      attributesDiv.appendChild(attrRow);
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
      const propRow = createEditableProperty(
        instance.element,
        propName,
        value,
        propertyEditor,
        onUpdate
      );
      propertiesSection.appendChild(propRow);
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

  // Slots Section - Enhanced with slot assignments
  if (instance.slots.size > 0 || (instance.shadowDOM && instance.shadowDOM.slotAssignments.size > 0)) {
    const slotsSection = document.createElement('div');
    slotsSection.className = 'wc-section';

    const slotTitle = document.createElement('div');
    slotTitle.className = 'wc-section-title';
    slotTitle.textContent = 'Slots';
    slotsSection.appendChild(slotTitle);

    const slotsDiv = document.createElement('div');

    // If we have shadow DOM info with slot assignments, use the detailed view
    if (instance.shadowDOM && instance.shadowDOM.slotAssignments.size > 0) {
      instance.shadowDOM.slotAssignments.forEach((assignment, slotName) => {
        const slotContainer = document.createElement('div');
        slotContainer.className = 'wc-slot-detail';
        
        const slotHeader = document.createElement('div');
        slotHeader.className = assignment.hasContent ? 'wc-slot has-content' : 'wc-slot';
        
        const slotNameSpan = document.createElement('span');
        slotNameSpan.className = 'wc-slot-name';
        slotNameSpan.textContent = slotName === 'default' ? '<slot>' : `<slot name="${slotName}">`;
        slotHeader.appendChild(slotNameSpan);
        
        slotHeader.appendChild(document.createTextNode(' '));
        
        const slotStatusSpan = document.createElement('span');
        slotStatusSpan.className = 'wc-slot-status';
        slotStatusSpan.textContent = assignment.hasContent 
          ? `(${assignment.assignedElements.length} element${assignment.assignedElements.length !== 1 ? 's' : ''})`
          : '(empty)';
        slotHeader.appendChild(slotStatusSpan);
        
        // Add hover effect to highlight the slot element
        slotHeader.style.cursor = assignment.hasContent ? 'pointer' : 'default';
        if (assignment.hasContent) {
          slotHeader.addEventListener('mouseenter', () => {
            if (document.body.contains(assignment.slotElement)) {
              highlightElement(assignment.slotElement);
            }
          });
          
          slotHeader.addEventListener('mouseleave', () => {
            if (document.body.contains(assignment.slotElement)) {
              unhighlightElement(assignment.slotElement);
            }
          });
        }
        
        slotContainer.appendChild(slotHeader);
        
        // Show assigned elements
        if (assignment.assignedElements.length > 0) {
          const assignedDiv = document.createElement('div');
          assignedDiv.className = 'wc-slot-assigned-inline';
          
          assignment.assignedElements.forEach((el, idx) => {
            if (idx > 0) {
              assignedDiv.appendChild(document.createTextNode(', '));
            }
            
            const elSpan = document.createElement('span');
            elSpan.className = 'wc-slot-assigned-tag';
            
            let text = `<${el.nodeName.toLowerCase()}`;
            const id = el.getAttribute('id');
            const className = el.getAttribute('class');
            
            if (id) text += `#${id}`;
            else if (className) text += `.${className.split(' ')[0]}`;
            
            text += '>';
            elSpan.textContent = text;
            
            // Add hover effect
            elSpan.style.cursor = 'pointer';
            elSpan.addEventListener('mouseenter', () => {
              if (document.body.contains(el)) {
                highlightElement(el);
              }
            });
            
            elSpan.addEventListener('mouseleave', () => {
              if (document.body.contains(el)) {
                unhighlightElement(el);
              }
            });
            
            // Click to scroll to element
            elSpan.addEventListener('click', (e) => {
              e.stopPropagation();
              if (document.body.contains(el)) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                highlightElement(el);
                setTimeout(() => {
                  unhighlightElement(el);
                }, 3000);
              }
            });
            
            assignedDiv.appendChild(elSpan);
          });
          
          slotContainer.appendChild(assignedDiv);
        }
        
        slotsDiv.appendChild(slotContainer);
      });
    } else {
      // Fallback to simple view if no shadow DOM info
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
    }

    slotsSection.appendChild(slotsDiv);
    detailsContainer.appendChild(slotsSection);
  }

  // Shadow DOM Section
  if (instance.shadowDOM) {
    const shadowSection = createShadowDOMSection(instance.shadowDOM);
    detailsContainer.appendChild(shadowSection);
  }

  // CSS Variables Section
  if (instance.cssVariables && instance.cssVariables.length > 0) {
    const cssVarsSection = createCSSVariablesSection(
      instance.cssVariables,
      instance.element,
      onUpdate
    );
    detailsContainer.appendChild(cssVarsSection);
  }

  instanceDiv.appendChild(detailsContainer);

  return instanceDiv;
}

export function createEventLogElement(log: EventLog): HTMLDivElement {
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
  
  return logDiv;
}

/**
 * Create an editable attribute row
 */
function createEditableAttribute(
  element: Element,
  attrName: string,
  value: string | null,
  propertyEditor?: PropertyEditor,
  onUpdate?: () => void
): HTMLDivElement {
  const attrRow = document.createElement('div');
  attrRow.className = 'wc-editable-attr';

  const attrNameSpan = document.createElement('span');
  attrNameSpan.className = 'wc-attribute-name';
  attrNameSpan.textContent = attrName;
  attrRow.appendChild(attrNameSpan);

  attrRow.appendChild(document.createTextNode('="'));

  const attrValueContainer = document.createElement('span');
  attrValueContainer.className = 'wc-editable-value-container';

  const attrValueSpan = document.createElement('span');
  attrValueSpan.className = 'wc-attribute-value wc-editable-value';
  attrValueSpan.textContent = value || '';
  attrValueSpan.title = 'Click to edit';
  attrValueContainer.appendChild(attrValueSpan);

  const editIcon = document.createElement('span');
  editIcon.className = 'wc-edit-icon';
  editIcon.innerHTML = '✎';
  editIcon.title = 'Edit attribute';
  attrValueContainer.appendChild(editIcon);

  attrRow.appendChild(attrValueContainer);
  attrRow.appendChild(document.createTextNode('"'));

  // Make it editable
  if (propertyEditor) {
    attrValueContainer.style.cursor = 'pointer';
    attrValueContainer.addEventListener('click', (e) => {
      e.stopPropagation();
      makeAttributeEditable(
        element,
        attrName,
        value || '',
        attrValueSpan,
        propertyEditor,
        onUpdate
      );
    });
  }

  return attrRow;
}

/**
 * Create an editable property row
 */
function createEditableProperty(
  element: Element,
  propName: string,
  value: unknown,
  propertyEditor?: PropertyEditor,
  onUpdate?: () => void
): HTMLDivElement {
  const propDiv = document.createElement('div');
  propDiv.className = 'wc-property wc-editable-prop';

  const propNameSpan = document.createElement('span');
  propNameSpan.className = 'wc-property-name';
  propNameSpan.textContent = propName;
  propDiv.appendChild(propNameSpan);

  propDiv.appendChild(document.createTextNode(': '));

  const valueContainer = document.createElement('span');
  valueContainer.className = 'wc-editable-value-container';

  const propValueSpan = document.createElement('span');
  propValueSpan.className = 'wc-property-value wc-editable-value';
  propValueSpan.textContent = formatPropertyValue(value);
  propValueSpan.title = 'Click to edit';
  valueContainer.appendChild(propValueSpan);

  const editIcon = document.createElement('span');
  editIcon.className = 'wc-edit-icon';
  editIcon.innerHTML = '✎';
  editIcon.title = 'Edit property';
  valueContainer.appendChild(editIcon);

  propDiv.appendChild(valueContainer);
  propDiv.appendChild(document.createTextNode(' '));

  const propTypeSpan = document.createElement('span');
  propTypeSpan.className = 'wc-property-type';
  const valueType = getValueType(value);
  propTypeSpan.textContent = `(${valueType})`;
  propDiv.appendChild(propTypeSpan);

  // Make it editable
  if (propertyEditor) {
    valueContainer.style.cursor = 'pointer';
    valueContainer.addEventListener('click', (e) => {
      e.stopPropagation();
      makePropertyEditable(
        element,
        propName,
        value,
        valueType,
        propValueSpan,
        propertyEditor,
        onUpdate
      );
    });
  }

  return propDiv;
}

/**
 * Make an attribute value editable inline
 */
function makeAttributeEditable(
  element: Element,
  attrName: string,
  currentValue: string,
  valueSpan: HTMLSpanElement,
  propertyEditor: PropertyEditor,
  onUpdate?: () => void
): void {
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'wc-inline-editor';
  input.value = currentValue;
  input.style.width = `${Math.max(100, currentValue.length * 8)}px`;

  const errorSpan = document.createElement('span');
  errorSpan.className = 'wc-edit-error';
  errorSpan.style.display = 'none';

  const save = () => {
    const newValue = input.value;
    
    // Update the attribute
    propertyEditor.setAttribute(element, attrName, newValue, onUpdate);
    
    // Restore display
    valueSpan.textContent = newValue;
    valueSpan.style.display = '';
    input.remove();
    errorSpan.remove();
  };

  const cancel = () => {
    valueSpan.style.display = '';
    input.remove();
    errorSpan.remove();
  };

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      save();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancel();
    }
  });

  input.addEventListener('blur', () => {
    save();
  });

  // Replace value span with input
  valueSpan.style.display = 'none';
  valueSpan.parentNode?.insertBefore(input, valueSpan);
  valueSpan.parentNode?.insertBefore(errorSpan, valueSpan);
  
  input.focus();
  input.select();
}

/**
 * Make a property value editable inline
 */
function makePropertyEditable(
  element: Element,
  propName: string,
  currentValue: unknown,
  valueType: string,
  valueSpan: HTMLSpanElement,
  propertyEditor: PropertyEditor,
  onUpdate?: () => void
): void {
  const currentValueStr = formatPropertyValueForEdit(currentValue);
  
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'wc-inline-editor';
  input.value = currentValueStr;
  input.style.width = `${Math.max(100, currentValueStr.length * 8)}px`;
  input.placeholder = `Enter ${valueType} value`;

  const errorSpan = document.createElement('span');
  errorSpan.className = 'wc-edit-error';
  errorSpan.style.display = 'none';

  const save = () => {
    const newValueStr = input.value;
    
    // Validate the new value
    const validation = propertyEditor.validateValue(newValueStr, valueType);
    
    if (!validation.valid) {
      // Show error
      errorSpan.textContent = validation.error || 'Invalid value';
      errorSpan.style.display = 'block';
      input.classList.add('error');
      return;
    }

    // Update the property
    propertyEditor.setProperty(element, propName, validation.value, onUpdate);
    
    // Restore display
    valueSpan.textContent = formatPropertyValue(validation.value);
    valueSpan.style.display = '';
    input.remove();
    errorSpan.remove();
  };

  const cancel = () => {
    valueSpan.style.display = '';
    input.remove();
    errorSpan.remove();
  };

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      save();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancel();
    }
  });

  input.addEventListener('input', () => {
    // Clear error on input
    if (errorSpan.style.display !== 'none') {
      errorSpan.style.display = 'none';
      input.classList.remove('error');
    }
  });

  input.addEventListener('blur', () => {
    // Small delay to allow Enter key to process
    setTimeout(save, 100);
  });

  // Replace value span with input
  valueSpan.style.display = 'none';
  valueSpan.parentNode?.insertBefore(input, valueSpan);
  valueSpan.parentNode?.insertBefore(errorSpan, valueSpan);
  
  input.focus();
  input.select();
}

/**
 * Update undo/redo button states
 */
export function updateUndoRedoButtons(canUndo: boolean, canRedo: boolean): void {
  const undoBtn = document.getElementById('wc-undo-btn') as HTMLButtonElement;
  const redoBtn = document.getElementById('wc-redo-btn') as HTMLButtonElement;
  
  if (undoBtn) {
    undoBtn.disabled = !canUndo;
  }
  if (redoBtn) {
    redoBtn.disabled = !canRedo;
  }
}

/**
 * Format a property value for editing (convert to string representation)
 */
function formatPropertyValueForEdit(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value) || typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

/**
 * Create a Shadow DOM section showing the shadow root tree
 */
function createShadowDOMSection(shadowInfo: ShadowDOMInfo): HTMLDivElement {
  const section = document.createElement('div');
  section.className = 'wc-section';
  
  const title = document.createElement('div');
  title.className = 'wc-section-title';
  title.textContent = 'Shadow DOM';
  section.appendChild(title);
  
  // Shadow root info
  const infoDiv = document.createElement('div');
  infoDiv.className = 'wc-shadow-info';
  
  const modeSpan = document.createElement('span');
  modeSpan.className = 'wc-shadow-mode';
  modeSpan.textContent = `Mode: ${shadowInfo.mode}`;
  infoDiv.appendChild(modeSpan);
  
  if (shadowInfo.adoptedStyleSheets > 0) {
    const stylesSpan = document.createElement('span');
    stylesSpan.className = 'wc-shadow-stylesheets';
    stylesSpan.textContent = ` • ${shadowInfo.adoptedStyleSheets} adopted stylesheet${shadowInfo.adoptedStyleSheets > 1 ? 's' : ''}`;
    infoDiv.appendChild(stylesSpan);
  }
  
  section.appendChild(infoDiv);
  
  // Custom properties
  if (shadowInfo.customProperties.size > 0) {
    const propsDiv = document.createElement('div');
    propsDiv.className = 'wc-shadow-custom-props';
    
    const propsTitle = document.createElement('div');
    propsTitle.className = 'wc-shadow-subsection-title';
    propsTitle.textContent = 'CSS Custom Properties';
    propsDiv.appendChild(propsTitle);
    
    shadowInfo.customProperties.forEach((value, prop) => {
      const propRow = document.createElement('div');
      propRow.className = 'wc-shadow-custom-prop';
      
      const propName = document.createElement('span');
      propName.className = 'wc-shadow-prop-name';
      propName.textContent = prop;
      propRow.appendChild(propName);
      
      propRow.appendChild(document.createTextNode(': '));
      
      const propValue = document.createElement('span');
      propValue.className = 'wc-shadow-prop-value';
      propValue.textContent = value;
      propRow.appendChild(propValue);
      
      propsDiv.appendChild(propRow);
    });
    
    section.appendChild(propsDiv);
  }
  
  // Slot assignments
  if (shadowInfo.slotAssignments.size > 0) {
    const slotsDiv = document.createElement('div');
    slotsDiv.className = 'wc-shadow-slots';
    
    const slotsTitle = document.createElement('div');
    slotsTitle.className = 'wc-shadow-subsection-title';
    slotsTitle.textContent = 'Slot Assignments';
    slotsDiv.appendChild(slotsTitle);
    
    shadowInfo.slotAssignments.forEach((assignment, slotName) => {
      const slotDiv = createSlotAssignmentElement(assignment);
      slotsDiv.appendChild(slotDiv);
    });
    
    section.appendChild(slotsDiv);
  }
  
  // Shadow DOM tree
  if (shadowInfo.children.length > 0) {
    const treeDiv = document.createElement('div');
    treeDiv.className = 'wc-shadow-tree';
    
    const treeTitle = document.createElement('div');
    treeTitle.className = 'wc-shadow-subsection-title';
    treeTitle.textContent = 'Shadow DOM Tree';
    treeDiv.appendChild(treeTitle);
    
    const treeContainer = document.createElement('div');
    treeContainer.className = 'wc-shadow-tree-container';
    
    shadowInfo.children.forEach((node) => {
      const nodeEl = createShadowDOMNodeElement(node, 0);
      treeContainer.appendChild(nodeEl);
    });
    
    treeDiv.appendChild(treeContainer);
    section.appendChild(treeDiv);
  }
  
  return section;
}

/**
 * Create an element showing slot assignment details
 */
function createSlotAssignmentElement(assignment: SlotAssignment): HTMLDivElement {
  const div = document.createElement('div');
  div.className = assignment.hasContent ? 'wc-slot-assignment has-content' : 'wc-slot-assignment';
  
  const header = document.createElement('div');
  header.className = 'wc-slot-assignment-header';
  
  const slotName = document.createElement('span');
  slotName.className = 'wc-slot-assignment-name';
  slotName.textContent = assignment.slotName === 'default' ? '<slot>' : `<slot name="${assignment.slotName}">`;
  header.appendChild(slotName);
  
  const count = document.createElement('span');
  count.className = 'wc-slot-assignment-count';
  count.textContent = ` (${assignment.assignedElements.length} element${assignment.assignedElements.length !== 1 ? 's' : ''})`;
  header.appendChild(count);
  
  div.appendChild(header);
  
  // Add hover effect to highlight the slot element itself
  div.addEventListener('mouseenter', () => {
    if (document.body.contains(assignment.slotElement)) {
      highlightElement(assignment.slotElement);
    }
  });
  
  div.addEventListener('mouseleave', () => {
    if (document.body.contains(assignment.slotElement)) {
      unhighlightElement(assignment.slotElement);
    }
  });
  
  // Show assigned elements
  if (assignment.assignedElements.length > 0) {
    const elementsDiv = document.createElement('div');
    elementsDiv.className = 'wc-slot-assigned-elements';
    
    assignment.assignedElements.forEach((el) => {
      const elDiv = document.createElement('div');
      elDiv.className = 'wc-slot-assigned-element';
      
      let text = `<${el.nodeName.toLowerCase()}`;
      
      // Add key attributes
      const id = el.getAttribute('id');
      const className = el.getAttribute('class');
      const slot = el.getAttribute('slot');
      
      if (id) text += ` id="${id}"`;
      if (className) text += ` class="${className}"`;
      if (slot) text += ` slot="${slot}"`;
      
      text += '>';
      
      elDiv.textContent = text;
      
      // Add hover effect to highlight individual slotted elements
      elDiv.style.cursor = 'pointer';
      elDiv.addEventListener('mouseenter', () => {
        if (document.body.contains(el)) {
          highlightElement(el);
        }
      });
      
      elDiv.addEventListener('mouseleave', () => {
        if (document.body.contains(el)) {
          unhighlightElement(el);
        }
      });
      
      // Click to scroll to element
      elDiv.addEventListener('click', () => {
        if (document.body.contains(el)) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          highlightElement(el);
          setTimeout(() => {
            unhighlightElement(el);
          }, 3000);
        }
      });
      
      elementsDiv.appendChild(elDiv);
    });
    
    div.appendChild(elementsDiv);
  }
  
  return div;
}

/**
 * Create a tree node element for shadow DOM visualization
 */
function createShadowDOMNodeElement(node: ShadowDOMNode, depth: number): HTMLDivElement {
  const nodeDiv = document.createElement('div');
  nodeDiv.className = 'wc-shadow-node';
  nodeDiv.style.marginLeft = `${depth * 16}px`;
  
  // Skip text nodes that are just whitespace
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent?.trim();
    if (!text) return nodeDiv;
    
    const textDiv = document.createElement('div');
    textDiv.className = 'wc-shadow-text-node';
    textDiv.textContent = `"${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`;
    nodeDiv.appendChild(textDiv);
    return nodeDiv;
  }
  
  // Element nodes
  if (node.nodeType === Node.ELEMENT_NODE) {
    const header = document.createElement('div');
    header.className = 'wc-shadow-node-header';
    
    // Expand/collapse indicator for nodes with children
    if (node.children.length > 0) {
      const expandBtn = document.createElement('span');
      expandBtn.className = 'wc-shadow-node-expand';
      expandBtn.textContent = '▶';
      header.appendChild(expandBtn);
      
      // Make expandable
      nodeDiv.classList.add('wc-shadow-node-expandable');
      
      expandBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        nodeDiv.classList.toggle('expanded');
      });
    } else {
      const spacer = document.createElement('span');
      spacer.className = 'wc-shadow-node-spacer';
      header.appendChild(spacer);
    }
    
    // Tag name
    const tagName = document.createElement('span');
    tagName.className = node.isSlot ? 'wc-shadow-node-tag slot' : 'wc-shadow-node-tag';
    tagName.textContent = `<${node.nodeName.toLowerCase()}`;
    header.appendChild(tagName);
    
    // Attributes
    if (node.attributes.size > 0) {
      const attrsSpan = document.createElement('span');
      attrsSpan.className = 'wc-shadow-node-attrs';
      
      const attrTexts: string[] = [];
      node.attributes.forEach((value, name) => {
        if (node.isSlot && name === 'name') {
          attrTexts.push(` name="${value}"`);
        } else if (value) {
          attrTexts.push(` ${name}="${value}"`);
        } else {
          attrTexts.push(` ${name}`);
        }
      });
      
      attrsSpan.textContent = attrTexts.join('');
      header.appendChild(attrsSpan);
    }
    
    tagName.appendChild(document.createTextNode('>'));
    
    nodeDiv.appendChild(header);
    
    // Children
    if (node.children.length > 0) {
      const childrenDiv = document.createElement('div');
      childrenDiv.className = 'wc-shadow-node-children';
      
      node.children.forEach((child) => {
        const childEl = createShadowDOMNodeElement(child, depth + 1);
        childrenDiv.appendChild(childEl);
      });
      
      nodeDiv.appendChild(childrenDiv);
    }
  }
  
  return nodeDiv;
}

/**
 * Create a CSS Variables section showing all CSS custom properties affecting the component
 */
function createCSSVariablesSection(
  cssVariables: CSSVariableInfo[],
  element: Element,
  onUpdate?: () => void
): HTMLDivElement {
  const section = document.createElement('div');
  section.className = 'wc-section';
  
  const title = document.createElement('div');
  title.className = 'wc-section-title';
  title.textContent = `CSS Variables (${cssVariables.length})`;
  section.appendChild(title);
  
  if (cssVariables.length === 0) {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'wc-css-variable-empty';
    emptyDiv.textContent = 'No CSS custom properties found';
    section.appendChild(emptyDiv);
    return section;
  }
  
  const varsDiv = document.createElement('div');
  varsDiv.className = 'wc-css-variables';
  
  cssVariables.forEach((cssVar) => {
    const varDiv = createCSSVariableElement(cssVar, element, onUpdate);
    varsDiv.appendChild(varDiv);
  });
  
  section.appendChild(varsDiv);
  
  return section;
}

/**
 * Create a single CSS variable display element
 */
function createCSSVariableElement(
  cssVar: CSSVariableInfo,
  element: Element,
  onUpdate?: () => void
): HTMLDivElement {
  const varDiv = document.createElement('div');
  varDiv.className = 'wc-css-variable';
  
  // Only make element-level variables editable
  const isEditable = cssVar.source === 'element' && !cssVar.selector;
  if (isEditable) {
    varDiv.classList.add('wc-css-variable-editable');
  }
  
  const header = document.createElement('div');
  header.className = 'wc-css-variable-header';
  
  const nameSpan = document.createElement('span');
  nameSpan.className = 'wc-css-variable-name';
  nameSpan.textContent = cssVar.name;
  header.appendChild(nameSpan);
  
  header.appendChild(document.createTextNode(': '));
  
  const valueSpan = document.createElement('span');
  valueSpan.className = 'wc-css-variable-value';
  valueSpan.textContent = cssVar.value || cssVar.computedValue;
  valueSpan.title = isEditable ? 'Click to edit' : 'Read-only';
  header.appendChild(valueSpan);
  
  if (isEditable) {
    const editIcon = document.createElement('span');
    editIcon.className = 'wc-css-variable-edit-icon';
    editIcon.innerHTML = '✎';
    header.appendChild(editIcon);
    
    // Make editable
    header.style.cursor = 'pointer';
    header.addEventListener('click', (e) => {
      e.stopPropagation();
      makeCSSVariableEditable(
        element,
        cssVar.name,
        cssVar.value || cssVar.computedValue,
        valueSpan,
        onUpdate
      );
    });
  }
  
  varDiv.appendChild(header);
  
  // Show computed value if different from declared value
  if (cssVar.value && cssVar.computedValue && cssVar.value !== cssVar.computedValue) {
    const computedDiv = document.createElement('div');
    computedDiv.className = 'wc-css-variable-computed';
    computedDiv.textContent = `Computed: ${cssVar.computedValue}`;
    varDiv.appendChild(computedDiv);
  }
  
  // Metadata
  const metaDiv = document.createElement('div');
  metaDiv.className = 'wc-css-variable-meta';
  
  // Source badge
  const sourceSpan = document.createElement('span');
  sourceSpan.className = `wc-css-variable-source ${cssVar.source}`;
  sourceSpan.textContent = cssVar.source;
  sourceSpan.title = getSourceDescription(cssVar.source);
  metaDiv.appendChild(sourceSpan);
  
  // Selector if present
  if (cssVar.selector) {
    const selectorSpan = document.createElement('span');
    selectorSpan.className = 'wc-css-variable-selector';
    selectorSpan.textContent = cssVar.selector;
    selectorSpan.title = 'CSS Selector';
    metaDiv.appendChild(selectorSpan);
  }
  
  // Inherited from element
  if (cssVar.inheritedFrom) {
    const inheritedSpan = document.createElement('span');
    inheritedSpan.className = 'wc-css-variable-inherited-from';
    inheritedSpan.textContent = `↑ ${cssVar.inheritedFrom.nodeName.toLowerCase()}`;
    inheritedSpan.title = 'Inherited from parent element';
    
    // Add hover effect to highlight the parent element
    inheritedSpan.style.cursor = 'pointer';
    inheritedSpan.addEventListener('mouseenter', () => {
      if (document.body.contains(cssVar.inheritedFrom!)) {
        highlightElement(cssVar.inheritedFrom!);
      }
    });
    
    inheritedSpan.addEventListener('mouseleave', () => {
      if (document.body.contains(cssVar.inheritedFrom!)) {
        unhighlightElement(cssVar.inheritedFrom!);
      }
    });
    
    // Click to scroll to element
    inheritedSpan.addEventListener('click', (e) => {
      e.stopPropagation();
      if (document.body.contains(cssVar.inheritedFrom!)) {
        cssVar.inheritedFrom!.scrollIntoView({ behavior: 'smooth', block: 'center' });
        highlightElement(cssVar.inheritedFrom!);
        setTimeout(() => {
          unhighlightElement(cssVar.inheritedFrom!);
        }, 3000);
      }
    });
    
    metaDiv.appendChild(inheritedSpan);
  }
  
  varDiv.appendChild(metaDiv);
  
  return varDiv;
}

/**
 * Make a CSS variable editable inline
 */
function makeCSSVariableEditable(
  element: Element,
  variableName: string,
  currentValue: string,
  valueSpan: HTMLSpanElement,
  onUpdate?: () => void
): void {
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'wc-inline-editor';
  input.value = currentValue;
  input.style.width = `${Math.max(150, currentValue.length * 8)}px`;
  input.placeholder = 'Enter CSS value';

  const errorSpan = document.createElement('span');
  errorSpan.className = 'wc-edit-error';
  errorSpan.style.display = 'none';

  const save = () => {
    const newValue = input.value.trim();
    
    // Update the CSS variable
    const success = updateCSSVariable(element, variableName, newValue);
    
    if (success) {
      // Restore display
      valueSpan.textContent = newValue;
      valueSpan.style.display = '';
      input.remove();
      errorSpan.remove();
      
      // Trigger update if callback provided
      if (onUpdate) {
        onUpdate();
      }
    } else {
      errorSpan.textContent = 'Failed to update CSS variable';
      errorSpan.style.display = 'block';
      input.classList.add('error');
    }
  };

  const cancel = () => {
    valueSpan.style.display = '';
    input.remove();
    errorSpan.remove();
  };

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      save();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancel();
    }
  });

  input.addEventListener('input', () => {
    // Clear error on input
    if (errorSpan.style.display !== 'none') {
      errorSpan.style.display = 'none';
      input.classList.remove('error');
    }
  });

  input.addEventListener('blur', () => {
    // Small delay to allow Enter key to process
    setTimeout(save, 100);
  });

  // Replace value span with input
  valueSpan.style.display = 'none';
  valueSpan.parentNode?.insertBefore(input, valueSpan);
  valueSpan.parentNode?.insertBefore(errorSpan, valueSpan);
  
  input.focus();
  input.select();
}

/**
 * Get a human-readable description of the CSS variable source
 */
function getSourceDescription(source: string): string {
  switch (source) {
    case 'element':
      return 'Defined directly on this element';
    case 'shadow-root':
      return 'Defined in component\'s Shadow DOM';
    case 'inherited':
      return 'Inherited from a parent element';
    case 'root':
      return 'Defined at document root level';
    default:
      return source;
  }
}
