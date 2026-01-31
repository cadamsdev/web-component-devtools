// UI components for Web Component Dev Tools

import type { InstanceInfo } from './types';
import { 
  highlightElement, 
  unhighlightElement, 
  formatPropertyValue, 
  getValueType,
  formatTimestamp,
  formatEventDetail 
} from './utils';
import type { EventLog } from './types';

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
  onClearEvents: () => void
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
  expandedStates: Map<Element, boolean>
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
