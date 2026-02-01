// UI components for Web Component Dev Tools

import type {
  InstanceInfo,
  ShadowDOMInfo,
  ShadowDOMNode,
  SlotAssignment,
  CSSVariableInfo,
} from './types';
import {
  highlightElement,
  unhighlightElement,
  formatPropertyValue,
  getValueType,
  formatTimestamp,
  formatEventDetail,
  createJSONTreeElement,
} from './utils';
import type { EventLog } from './types';
import { PropertyEditor } from './property-editor';
import { updateCSSVariable } from './css-variable-tracker';
import type { A11yAuditResult, A11yIssue } from './accessibility-checker';
import type { A11yTreeNode } from './accessibility-tree';

export function createButton(): HTMLButtonElement {
  const button = document.createElement('button');
  button.id = 'wc-devtools-btn';
  button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><path fill="none" d="m179.9 388l-76.16-132zm0 0h152.21l76.15-132l-76.15-132H179.9l-76.16 132zm-76.16-132l76.16-132z"/><path fill="currentColor" d="M496 256L376 48H239.74l-43.84 76h136.21l76.15 132l-76.15 132H195.9l43.84 76H376z"/><path fill="currentColor" d="m179.9 388l-76.16-132l76.16-132l43.84-76H136L16 256l120 208h87.74z"/></svg>';
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
  onToggleRenderOverlay?: () => void,
  onToggleComponentOverlay?: () => void,
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

  const a11yTab = document.createElement('button');
  a11yTab.className = 'wc-devtools-tab';
  a11yTab.textContent = 'Accessibility';
  a11yTab.dataset.tab = 'accessibility';
  tabsSection.appendChild(a11yTab);

  // Search bar section (only for components tab)
  const searchSection = document.createElement('div');
  searchSection.className = 'wc-devtools-search';
  searchSection.dataset.tabContent = 'components';

  // Create a wrapper for the search input and clear button
  const searchInputWrapper = document.createElement('div');
  searchInputWrapper.className = 'wc-search-input-wrapper';

  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Filter by tag name...';
  searchInput.id = 'wc-devtools-search-input';
  searchInput.addEventListener('input', (e) => {
    const value = (e.target as HTMLInputElement).value.toLowerCase().trim();
    onSearch(value);
    // Show/hide clear button based on input value
    clearButton.style.display = value ? 'flex' : 'none';
  });

  // Create clear button
  const clearButton = document.createElement('button');
  clearButton.className = 'wc-search-clear-btn';
  clearButton.innerHTML = '×';
  clearButton.title = 'Clear search';
  clearButton.style.display = 'none'; // Hidden by default
  clearButton.addEventListener('click', () => {
    searchInput.value = '';
    onSearch('');
    clearButton.style.display = 'none';
    searchInput.focus();
  });

  searchInputWrapper.appendChild(searchInput);
  searchInputWrapper.appendChild(clearButton);
  searchSection.appendChild(searchInputWrapper);

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

  // Add component overlay toggle (show tag names on page)
  const componentOverlayToggle = document.createElement('button');
  componentOverlayToggle.className = 'wc-component-overlay-toggle';
  componentOverlayToggle.title = 'Show component tag names on page';
  componentOverlayToggle.id = 'wc-component-overlay-toggle';
  componentOverlayToggle.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <path d="M7 8h10M7 12h10M7 16h6"/>
    </svg>
  `;
  if (onToggleComponentOverlay) {
    componentOverlayToggle.addEventListener('click', onToggleComponentOverlay);
  }
  undoRedoControls.appendChild(componentOverlayToggle);

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

  // Event filters section - will be populated dynamically
  const eventsFilters = document.createElement('div');
  eventsFilters.className = 'wc-events-filters';
  eventsFilters.dataset.tabContent = 'events';
  eventsFilters.style.display = 'none';
  eventsFilters.id = 'wc-events-filters';

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

  // Accessibility content
  const a11yContent = document.createElement('div');
  a11yContent.className = 'wc-devtools-content wc-devtools-tab-content';
  a11yContent.id = 'wc-devtools-accessibility';
  a11yContent.dataset.tab = 'accessibility';
  a11yContent.innerHTML =
    '<div class="wc-no-components">Select a component to view accessibility information</div>';

  panel.appendChild(header);
  panel.appendChild(tabsSection);
  panel.appendChild(searchSection);
  panel.appendChild(eventsControls);
  panel.appendChild(eventsFilters);
  panel.appendChild(componentsContent);
  panel.appendChild(eventsContent);
  panel.appendChild(a11yContent);

  // Tab switching logic
  componentsTab.addEventListener('click', () => onTabSwitch('components'));
  eventsTab.addEventListener('click', () => onTabSwitch('events'));
  a11yTab.addEventListener('click', () => onTabSwitch('accessibility'));

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
  onUpdate?: () => void,
  a11yChecker?: import('./accessibility-checker').AccessibilityChecker,
  onA11yBadgeClick?: (element: Element) => void,
  a11yAuditCache?: WeakMap<Element, import('./accessibility-checker').A11yAuditResult>,
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

  // Add accessibility indicator badge
  if (a11yChecker && a11yAuditCache) {
    // Use cached audit result for consistency
    const a11yAudit = a11yAuditCache.get(instance.element);

    if (a11yAudit) {
      const a11yBadge = document.createElement('span');
      a11yBadge.className = 'wc-a11y-badge';

      // Determine badge status based on score and issues
      let status: 'good' | 'warning' | 'error';
      let icon: string;
      let text: string;

      const errorCount = a11yAudit.issues.filter((i) => i.type === 'error').length;
      const warningCount = a11yAudit.issues.filter((i) => i.type === 'warning').length;

      if (errorCount > 0) {
        status = 'error';
        icon = '⚠';
        text = `${errorCount} issue${errorCount !== 1 ? 's' : ''}`;
      } else if (warningCount > 0) {
        status = 'warning';
        icon = '⚡';
        text = `${warningCount} warning${warningCount !== 1 ? 's' : ''}`;
      } else {
        status = 'good';
        icon = '✓';
        text = 'accessible';
      }

      a11yBadge.classList.add(`wc-a11y-badge-${status}`);
      a11yBadge.innerHTML = `${icon} ${text}`;
      a11yBadge.title = `Accessibility Score: ${a11yAudit.score}/100\n${a11yAudit.issues.length} total issue${a11yAudit.issues.length !== 1 ? 's' : ''} found\nClick to view details`;

      // Make badge clickable
      a11yBadge.style.cursor = 'pointer';
      a11yBadge.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (onA11yBadgeClick) {
          onA11yBadgeClick(instance.element);
        }
      });

      nameAndIndex.appendChild(a11yBadge);
    }
  }

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
        onUpdate,
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
        onUpdate,
      );
      propertiesSection.appendChild(propRow);
    });

    detailsContainer.appendChild(propertiesSection);
  }

  // Slots Section (from Shadow DOM)
  if (instance.shadowDOM && instance.shadowDOM.slotAssignments.size > 0) {
    const slotsSection = document.createElement('div');
    slotsSection.className = 'wc-section';

    const slotsTitle = document.createElement('div');
    slotsTitle.className = 'wc-section-title';
    slotsTitle.textContent = 'Slots';
    slotsSection.appendChild(slotsTitle);

    const slotsDiv = document.createElement('div');
    slotsDiv.className = 'wc-shadow-slots';

    instance.shadowDOM.slotAssignments.forEach((assignment, slotName) => {
      const slotDiv = createSlotAssignmentElement(assignment);
      slotsDiv.appendChild(slotDiv);
    });

    slotsSection.appendChild(slotsDiv);
    detailsContainer.appendChild(slotsSection);
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

  // CSS Variables Section
  if (instance.cssVariables && instance.cssVariables.length > 0) {
    const cssVarsSection = createCSSVariablesSection(
      instance.cssVariables,
      instance.element,
      onUpdate,
    );
    detailsContainer.appendChild(cssVarsSection);
  }

  // Shadow DOM Section (info and mode)
  if (instance.shadowDOM) {
    const shadowSection = document.createElement('div');
    shadowSection.className = 'wc-section';

    const title = document.createElement('div');
    title.className = 'wc-section-title';
    title.textContent = 'Shadow DOM';
    shadowSection.appendChild(title);

    // Shadow root info
    const infoDiv = document.createElement('div');
    infoDiv.className = 'wc-shadow-info';

    const modeSpan = document.createElement('span');
    modeSpan.className = 'wc-shadow-mode';
    modeSpan.textContent = `Mode: ${instance.shadowDOM.mode}`;
    infoDiv.appendChild(modeSpan);

    if (instance.shadowDOM.adoptedStyleSheets > 0) {
      const stylesSpan = document.createElement('span');
      stylesSpan.className = 'wc-shadow-stylesheets';
      stylesSpan.textContent = ` • ${instance.shadowDOM.adoptedStyleSheets} adopted stylesheet${instance.shadowDOM.adoptedStyleSheets > 1 ? 's' : ''}`;
      infoDiv.appendChild(stylesSpan);
    }

    shadowSection.appendChild(infoDiv);
    detailsContainer.appendChild(shadowSection);
  }

  // Shadow DOM Tree Section
  if (instance.shadowDOM && instance.shadowDOM.children.length > 0) {
    const treeSection = document.createElement('div');
    treeSection.className = 'wc-section';

    const treeTitle = document.createElement('div');
    treeTitle.className = 'wc-section-title';
    treeTitle.textContent = 'Shadow DOM Tree';
    treeSection.appendChild(treeTitle);

    const treeDiv = document.createElement('div');
    treeDiv.className = 'wc-shadow-tree';

    const treeContainer = document.createElement('div');
    treeContainer.className = 'wc-shadow-tree-container';

    instance.shadowDOM.children.forEach((node) => {
      const nodeEl = createShadowDOMNodeElement(node, 0);
      treeContainer.appendChild(nodeEl);
    });

    treeDiv.appendChild(treeContainer);
    treeSection.appendChild(treeDiv);
    detailsContainer.appendChild(treeSection);
  }

  // Nested Components Section
  if (instance.nestedComponents && instance.nestedComponents.length > 0) {
    const nestedSection = document.createElement('div');
    nestedSection.className = 'wc-section';

    const nestedTitle = document.createElement('div');
    nestedTitle.className = 'wc-section-title';
    nestedTitle.textContent = `Nested Components (${instance.nestedComponents.length})`;
    nestedSection.appendChild(nestedTitle);

    const nestedContainer = document.createElement('div');
    nestedContainer.className = 'wc-nested-components';

    instance.nestedComponents.forEach((nestedInstance, nestedIndex) => {
      const nestedEl = createNestedComponentElement(
        nestedInstance,
        nestedIndex,
        expandedStates,
        propertyEditor,
        onUpdate,
        a11yChecker,
        onA11yBadgeClick,
        a11yAuditCache,
      );
      nestedContainer.appendChild(nestedEl);
    });

    nestedSection.appendChild(nestedContainer);
    detailsContainer.appendChild(nestedSection);
  }

  instanceDiv.appendChild(detailsContainer);

  return instanceDiv;
}

/**
 * Create a nested component element (similar to instance but for nested components in shadow DOM)
 */
function createNestedComponentElement(
  instance: InstanceInfo,
  index: number,
  expandedStates: Map<Element, boolean>,
  propertyEditor?: PropertyEditor,
  onUpdate?: () => void,
  a11yChecker?: import('./accessibility-checker').AccessibilityChecker,
  onA11yBadgeClick?: (element: Element) => void,
  a11yAuditCache?: WeakMap<Element, import('./accessibility-checker').A11yAuditResult>,
): HTMLDivElement {
  const nestedDiv = document.createElement('div');
  const isExpanded = expandedStates.get(instance.element) || false;
  nestedDiv.className = isExpanded ? 'wc-nested-component expanded' : 'wc-nested-component';

  // Header with component name
  const header = document.createElement('div');
  header.className = 'wc-nested-header';

  const nameAndBadge = document.createElement('div');
  nameAndBadge.className = 'wc-nested-name';

  const indexBadge = document.createElement('span');
  indexBadge.className = 'wc-nested-badge';
  indexBadge.textContent = `#${index + 1}`;
  nameAndBadge.appendChild(indexBadge);

  nameAndBadge.appendChild(document.createTextNode(` <${instance.tagName}>`));

  // Add accessibility indicator badge
  if (a11yChecker && a11yAuditCache) {
    const a11yAudit = a11yAuditCache.get(instance.element);

    if (a11yAudit) {
      const a11yBadge = document.createElement('span');
      a11yBadge.className = 'wc-a11y-badge';

      const errorCount = a11yAudit.issues.filter((i) => i.type === 'error').length;
      const warningCount = a11yAudit.issues.filter((i) => i.type === 'warning').length;

      let status: 'good' | 'warning' | 'error';
      let icon: string;
      let text: string;

      if (errorCount > 0) {
        status = 'error';
        icon = '⚠';
        text = `${errorCount} issue${errorCount !== 1 ? 's' : ''}`;
      } else if (warningCount > 0) {
        status = 'warning';
        icon = '⚡';
        text = `${warningCount} warning${warningCount !== 1 ? 's' : ''}`;
      } else {
        status = 'good';
        icon = '✓';
        text = 'accessible';
      }

      a11yBadge.classList.add(`wc-a11y-badge-${status}`);
      a11yBadge.innerHTML = `${icon} ${text}`;
      a11yBadge.title = `Accessibility Score: ${a11yAudit.score}/100\nClick to view details`;

      a11yBadge.style.cursor = 'pointer';
      a11yBadge.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (onA11yBadgeClick) {
          onA11yBadgeClick(instance.element);
        }
      });

      nameAndBadge.appendChild(a11yBadge);
    }
  }

  // Add render count badge if available
  if (instance.renderCount !== undefined && instance.renderCount > 0) {
    const renderBadge = document.createElement('span');
    renderBadge.className = 'wc-render-count-badge';
    renderBadge.textContent = `${instance.renderCount} render${instance.renderCount !== 1 ? 's' : ''}`;
    renderBadge.title = `This component has re-rendered ${instance.renderCount} time${instance.renderCount !== 1 ? 's' : ''}`;
    nameAndBadge.appendChild(renderBadge);
  }

  header.appendChild(nameAndBadge);

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

  nestedDiv.appendChild(header);

  // Create details container (same structure as main component)
  const detailsContainer = document.createElement('div');
  detailsContainer.className = 'wc-nested-details';

  // Add hover effect
  nestedDiv.addEventListener('mouseenter', () => {
    highlightElement(instance.element);
  });

  nestedDiv.addEventListener('mouseleave', () => {
    unhighlightElement(instance.element);
  });

  // Toggle expand/collapse
  header.style.cursor = 'pointer';
  header.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    const newExpandedState = !expandedStates.get(instance.element);
    expandedStates.set(instance.element, newExpandedState);
    nestedDiv.classList.toggle('expanded');
  });

  detailsContainer.addEventListener('click', (e) => {
    e.stopPropagation();
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
        onUpdate,
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
        onUpdate,
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

  // Recursively show nested components within this nested component
  if (instance.nestedComponents && instance.nestedComponents.length > 0) {
    const nestedNestedSection = document.createElement('div');
    nestedNestedSection.className = 'wc-section';

    const nestedNestedTitle = document.createElement('div');
    nestedNestedTitle.className = 'wc-section-title';
    nestedNestedTitle.textContent = `Nested Components (${instance.nestedComponents.length})`;
    nestedNestedSection.appendChild(nestedNestedTitle);

    const nestedNestedContainer = document.createElement('div');
    nestedNestedContainer.className = 'wc-nested-components';

    instance.nestedComponents.forEach((nestedInstance, nestedIndex) => {
      const nestedEl = createNestedComponentElement(
        nestedInstance,
        nestedIndex,
        expandedStates,
        propertyEditor,
        onUpdate,
        a11yChecker,
        onA11yBadgeClick,
        a11yAuditCache,
      );
      nestedNestedContainer.appendChild(nestedEl);
    });

    nestedNestedSection.appendChild(nestedNestedContainer);
    detailsContainer.appendChild(nestedNestedSection);
  }

  nestedDiv.appendChild(detailsContainer);

  return nestedDiv;
}

export function createEventLogElement(
  log: EventLog,
  onReplay?: (timestamp: number) => void,
): HTMLDivElement {
  const logDiv = document.createElement('div');
  logDiv.className = 'wc-event-log';

  // Add badges for special states
  if (log.defaultPrevented) {
    logDiv.classList.add('prevented-default');
  }
  if (log.propagationStopped) {
    logDiv.classList.add('stopped-propagation');
  }

  const header = document.createElement('div');
  header.className = 'wc-event-header';

  const leftSide = document.createElement('div');
  leftSide.className = 'wc-event-header-left';

  const eventType = document.createElement('span');
  eventType.className = 'wc-event-type';
  eventType.textContent = log.eventType;
  leftSide.appendChild(eventType);

  // Add badges for event properties
  const badges = document.createElement('span');
  badges.className = 'wc-event-badges';

  if (!log.isTrusted) {
    const badge = document.createElement('span');
    badge.className = 'wc-event-badge synthetic';
    badge.textContent = 'synthetic';
    badge.title = 'This event was created programmatically';
    badges.appendChild(badge);
  }

  if (log.defaultPrevented) {
    const badge = document.createElement('span');
    badge.className = 'wc-event-badge prevented';
    badge.textContent = 'prevented';
    badge.title = 'preventDefault() was called';
    badges.appendChild(badge);
  }

  if (log.immediatePropagationStopped) {
    const badge = document.createElement('span');
    badge.className = 'wc-event-badge stopped-immediate';
    badge.textContent = 'stopped immediately';
    badge.title = 'stopImmediatePropagation() was called';
    badges.appendChild(badge);
  } else if (log.propagationStopped) {
    const badge = document.createElement('span');
    badge.className = 'wc-event-badge stopped';
    badge.textContent = 'stopped';
    badge.title = 'stopPropagation() was called';
    badges.appendChild(badge);
  }

  leftSide.appendChild(badges);
  header.appendChild(leftSide);

  const rightSide = document.createElement('div');
  rightSide.className = 'wc-event-header-right';

  const timestamp = document.createElement('span');
  timestamp.className = 'wc-event-timestamp';
  timestamp.textContent = formatTimestamp(log.timestamp);
  rightSide.appendChild(timestamp);

  // Add replay button
  if (onReplay) {
    const replayBtn = document.createElement('button');
    replayBtn.className = 'wc-event-replay-btn';
    replayBtn.innerHTML = '↻';
    replayBtn.title = 'Replay this event';
    replayBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      onReplay(log.timestamp);
    });
    rightSide.appendChild(replayBtn);
  }

  header.appendChild(rightSide);
  logDiv.appendChild(header);

  const source = document.createElement('div');
  source.className = 'wc-event-source';
  source.textContent = `<${log.tagName}>`;

  // Add event properties
  const propsDiv = document.createElement('span');
  propsDiv.className = 'wc-event-props';

  const props: string[] = [];
  if (log.bubbles) props.push('bubbles');
  if (log.cancelable) props.push('cancelable');
  if (log.composed) props.push('composed');

  if (props.length > 0) {
    propsDiv.textContent = ` • ${props.join(', ')}`;
    source.appendChild(propsDiv);
  }

  logDiv.appendChild(source);

  // Event propagation path
  if (log.propagationPath && log.propagationPath.length > 0) {
    const pathSection = document.createElement('div');
    pathSection.className = 'wc-event-propagation-section';

    const pathHeader = document.createElement('div');
    pathHeader.className = 'wc-event-propagation-header';

    const pathToggle = document.createElement('span');
    pathToggle.className = 'wc-event-propagation-toggle';
    pathToggle.textContent = '▶';
    pathHeader.appendChild(pathToggle);

    const pathTitle = document.createElement('span');
    pathTitle.textContent = `Propagation Path (${log.propagationPath.length} elements)`;
    pathHeader.appendChild(pathTitle);

    const pathContent = document.createElement('div');
    pathContent.className = 'wc-event-propagation-path';
    pathContent.style.display = 'none';

    // Group by phase
    const capturingPhase = log.propagationPath.filter((p) => p.phase === 'capturing');
    const targetPhase = log.propagationPath.filter((p) => p.phase === 'target');
    const bubblingPhase = log.propagationPath.filter((p) => p.phase === 'bubbling');

    if (capturingPhase.length > 0) {
      const phaseTitle = document.createElement('div');
      phaseTitle.className = 'wc-event-phase-title capturing';
      phaseTitle.textContent = '↓ Capturing Phase';
      pathContent.appendChild(phaseTitle);

      capturingPhase.forEach((pathItem) => {
        const pathEl = createPropagationPathElement(pathItem);
        pathContent.appendChild(pathEl);
      });
    }

    if (targetPhase.length > 0) {
      const phaseTitle = document.createElement('div');
      phaseTitle.className = 'wc-event-phase-title target';
      phaseTitle.textContent = '◉ Target Phase';
      pathContent.appendChild(phaseTitle);

      targetPhase.forEach((pathItem) => {
        const pathEl = createPropagationPathElement(pathItem);
        pathContent.appendChild(pathEl);
      });
    }

    if (bubblingPhase.length > 0) {
      const phaseTitle = document.createElement('div');
      phaseTitle.className = 'wc-event-phase-title bubbling';
      phaseTitle.textContent = '↑ Bubbling Phase';
      pathContent.appendChild(phaseTitle);

      bubblingPhase.forEach((pathItem) => {
        const pathEl = createPropagationPathElement(pathItem);
        pathContent.appendChild(pathEl);
      });
    }

    pathHeader.style.cursor = 'pointer';
    pathHeader.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = pathContent.style.display === 'block';
      pathContent.style.display = isExpanded ? 'none' : 'block';
      pathToggle.textContent = isExpanded ? '▶' : '▼';
      pathSection.classList.toggle('expanded');
    });

    pathSection.appendChild(pathHeader);
    pathSection.appendChild(pathContent);
    logDiv.appendChild(pathSection);
  }

  // Event detail
  if (log.detail !== undefined && log.detail !== null) {
    const detailSection = document.createElement('div');
    detailSection.className = 'wc-event-detail-section';

    const detailHeader = document.createElement('div');
    detailHeader.className = 'wc-event-detail-header';

    const detailToggle = document.createElement('span');
    detailToggle.className = 'wc-event-detail-toggle';
    detailToggle.textContent = '▶';
    detailHeader.appendChild(detailToggle);

    const detailTitle = document.createElement('span');
    detailTitle.textContent = 'Event Detail';
    detailHeader.appendChild(detailTitle);

    const detailContent = document.createElement('div');
    detailContent.className = 'wc-event-detail-content';
    detailContent.style.display = 'none';

    // Use JSON tree viewer for complex objects
    if (typeof log.detail === 'object' && log.detail !== null) {
      const jsonTree = createJSONTreeElement(log.detail);
      detailContent.appendChild(jsonTree);
    } else {
      detailContent.textContent = formatEventDetail(log.detail);
    }

    detailHeader.style.cursor = 'pointer';
    detailHeader.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = detailContent.style.display === 'block';
      detailContent.style.display = isExpanded ? 'none' : 'block';
      detailToggle.textContent = isExpanded ? '▶' : '▼';
      detailSection.classList.toggle('expanded');
    });

    detailSection.appendChild(detailHeader);
    detailSection.appendChild(detailContent);
    logDiv.appendChild(detailSection);
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

  // Click to scroll to element (but not when clicking buttons or expandable sections)
  logDiv.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('.wc-event-propagation-header') ||
      target.closest('.wc-event-detail-header')
    ) {
      return;
    }

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
 * Create a propagation path element
 */
function createPropagationPathElement(
  pathItem: import('./types').EventPropagationPath,
): HTMLDivElement {
  const pathEl = document.createElement('div');
  pathEl.className = `wc-event-path-item ${pathItem.phase}`;
  pathEl.textContent = `<${pathItem.tagName}>`;

  // Add hover effect
  pathEl.addEventListener('mouseenter', () => {
    if (document.body.contains(pathItem.element)) {
      highlightElement(pathItem.element);
    }
  });

  pathEl.addEventListener('mouseleave', () => {
    if (document.body.contains(pathItem.element)) {
      unhighlightElement(pathItem.element);
    }
  });

  // Click to scroll to element
  pathEl.addEventListener('click', (e) => {
    e.stopPropagation();
    if (document.body.contains(pathItem.element)) {
      pathItem.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      highlightElement(pathItem.element);
      setTimeout(() => {
        unhighlightElement(pathItem.element);
      }, 3000);
    }
  });

  pathEl.style.cursor = 'pointer';

  return pathEl;
}

/**
 * Create or update event filter controls
 */
export function updateEventFiltersUI(
  eventTypes: string[],
  components: string[],
  currentFilter: import('./types').EventFilter,
  onFilterChange: (filter: Partial<import('./types').EventFilter>) => void,
): void {
  const filtersContainer = document.getElementById('wc-events-filters');
  if (!filtersContainer) return;

  filtersContainer.innerHTML = '';

  // Filter by event type
  if (eventTypes.length > 0) {
    const typeFilter = document.createElement('div');
    typeFilter.className = 'wc-event-filter-group';

    const typeLabel = document.createElement('label');
    typeLabel.textContent = 'Event Type:';
    typeFilter.appendChild(typeLabel);

    const typeSelect = document.createElement('select');
    typeSelect.className = 'wc-event-filter-select';
    typeSelect.multiple = true;
    typeSelect.size = Math.min(5, eventTypes.length + 1);

    const allOption = document.createElement('option');
    allOption.value = '';
    allOption.textContent = '(All Events)';
    allOption.selected = currentFilter.eventTypes.length === 0;
    typeSelect.appendChild(allOption);

    eventTypes.forEach((type) => {
      const option = document.createElement('option');
      option.value = type;
      option.textContent = type;
      option.selected = currentFilter.eventTypes.includes(type);
      typeSelect.appendChild(option);
    });

    typeSelect.addEventListener('change', () => {
      const selected = Array.from(typeSelect.selectedOptions)
        .map((opt) => opt.value)
        .filter((v) => v !== '');
      onFilterChange({ eventTypes: selected });
    });

    typeFilter.appendChild(typeSelect);
    filtersContainer.appendChild(typeFilter);
  }

  // Filter by component
  if (components.length > 0) {
    const componentFilter = document.createElement('div');
    componentFilter.className = 'wc-event-filter-group';

    const componentLabel = document.createElement('label');
    componentLabel.textContent = 'Component:';
    componentFilter.appendChild(componentLabel);

    const componentSelect = document.createElement('select');
    componentSelect.className = 'wc-event-filter-select';
    componentSelect.multiple = true;
    componentSelect.size = Math.min(5, components.length + 1);

    const allOption = document.createElement('option');
    allOption.value = '';
    allOption.textContent = '(All Components)';
    allOption.selected = currentFilter.components.length === 0;
    componentSelect.appendChild(allOption);

    components.forEach((comp) => {
      const option = document.createElement('option');
      option.value = comp;
      option.textContent = `<${comp}>`;
      option.selected = currentFilter.components.includes(comp);
      componentSelect.appendChild(option);
    });

    componentSelect.addEventListener('change', () => {
      const selected = Array.from(componentSelect.selectedOptions)
        .map((opt) => opt.value)
        .filter((v) => v !== '');
      onFilterChange({ components: selected });
    });

    componentFilter.appendChild(componentSelect);
    filtersContainer.appendChild(componentFilter);
  }

  // Special filters
  const specialFilters = document.createElement('div');
  specialFilters.className = 'wc-event-filter-group special-filters';

  const preventedCheckbox = document.createElement('label');
  preventedCheckbox.className = 'wc-event-filter-checkbox';
  const preventedInput = document.createElement('input');
  preventedInput.type = 'checkbox';
  preventedInput.checked = currentFilter.onlyPreventedDefaults;
  preventedInput.addEventListener('change', () => {
    onFilterChange({ onlyPreventedDefaults: preventedInput.checked });
  });
  preventedCheckbox.appendChild(preventedInput);
  preventedCheckbox.appendChild(document.createTextNode(' Only Prevented Defaults'));
  specialFilters.appendChild(preventedCheckbox);

  const stoppedCheckbox = document.createElement('label');
  stoppedCheckbox.className = 'wc-event-filter-checkbox';
  const stoppedInput = document.createElement('input');
  stoppedInput.type = 'checkbox';
  stoppedInput.checked = currentFilter.onlyStoppedPropagation;
  stoppedInput.addEventListener('change', () => {
    onFilterChange({ onlyStoppedPropagation: stoppedInput.checked });
  });
  stoppedCheckbox.appendChild(stoppedInput);
  stoppedCheckbox.appendChild(document.createTextNode(' Only Stopped Propagation'));
  specialFilters.appendChild(stoppedCheckbox);

  filtersContainer.appendChild(specialFilters);

  // Search filter
  const searchFilter = document.createElement('div');
  searchFilter.className = 'wc-event-filter-group';

  const searchLabel = document.createElement('label');
  searchLabel.textContent = 'Search:';
  searchFilter.appendChild(searchLabel);

  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.className = 'wc-event-filter-search';
  searchInput.placeholder = 'Filter events...';
  searchInput.value = currentFilter.searchText;
  searchInput.addEventListener('input', () => {
    onFilterChange({ searchText: searchInput.value });
  });
  searchFilter.appendChild(searchInput);

  filtersContainer.appendChild(searchFilter);

  // Reset filters button
  const resetBtn = document.createElement('button');
  resetBtn.className = 'wc-event-filter-reset';
  resetBtn.textContent = 'Reset Filters';
  resetBtn.addEventListener('click', () => {
    onFilterChange({
      eventTypes: [],
      components: [],
      onlyPreventedDefaults: false,
      onlyStoppedPropagation: false,
      searchText: '',
    });
  });
  filtersContainer.appendChild(resetBtn);
}

/**
 * Create an editable attribute row
 */
function createEditableAttribute(
  element: Element,
  attrName: string,
  value: string | null,
  propertyEditor?: PropertyEditor,
  onUpdate?: () => void,
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
        onUpdate,
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
  onUpdate?: () => void,
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
        onUpdate,
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
  onUpdate?: () => void,
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
  onUpdate?: () => void,
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
  slotName.textContent =
    assignment.slotName === 'default' ? '<slot>' : `<slot name="${assignment.slotName}">`;
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
  onUpdate?: () => void,
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
  onUpdate?: () => void,
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
        onUpdate,
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
  onUpdate?: () => void,
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
      return "Defined in component's Shadow DOM";
    case 'inherited':
      return 'Inherited from a parent element';
    case 'root':
      return 'Defined at document root level';
    default:
      return source;
  }
}

/**
 * Create accessibility audit view element
 */
export function createAccessibilityAuditElement(audit: A11yAuditResult): HTMLDivElement {
  const auditDiv = document.createElement('div');
  auditDiv.className = 'wc-a11y-audit';

  // Score header
  const scoreHeader = document.createElement('div');
  scoreHeader.className = 'wc-a11y-score-header';

  const scoreCircle = document.createElement('div');
  scoreCircle.className = `wc-a11y-score-circle ${getScoreClass(audit.score)}`;
  scoreCircle.textContent = Math.round(audit.score).toString();
  scoreHeader.appendChild(scoreCircle);

  const scoreInfo = document.createElement('div');
  scoreInfo.className = 'wc-a11y-score-info';

  const scoreTitle = document.createElement('div');
  scoreTitle.className = 'wc-a11y-score-title';
  scoreTitle.textContent = `Accessibility Score`;
  scoreInfo.appendChild(scoreTitle);

  const scoreDesc = document.createElement('div');
  scoreDesc.className = 'wc-a11y-score-desc';
  scoreDesc.textContent = getScoreDescription(audit.score);
  scoreInfo.appendChild(scoreDesc);

  scoreHeader.appendChild(scoreInfo);
  auditDiv.appendChild(scoreHeader);

  // Quick summary
  const summary = document.createElement('div');
  summary.className = 'wc-a11y-summary';

  const summaryItems = [
    {
      icon: '⌨️',
      label: 'Keyboard Support',
      value: audit.hasKeyboardSupport ? 'Yes' : 'No',
      status: audit.hasKeyboardSupport ? 'good' : 'bad',
    },
    {
      icon: '🎯',
      label: 'Focus Management',
      value: audit.hasFocusManagement ? 'Yes' : 'No',
      status: audit.hasFocusManagement ? 'good' : 'bad',
    },
    {
      icon: '🏷️',
      label: 'ARIA Labels',
      value: audit.hasAriaLabels ? 'Yes' : 'No',
      status: audit.hasAriaLabels ? 'good' : 'bad',
    },
  ];

  summaryItems.forEach((item) => {
    const summaryItem = document.createElement('div');
    summaryItem.className = `wc-a11y-summary-item ${item.status}`;
    summaryItem.innerHTML = `
      <span class="wc-a11y-summary-icon">${item.icon}</span>
      <span class="wc-a11y-summary-label">${item.label}:</span>
      <span class="wc-a11y-summary-value">${item.value}</span>
    `;
    summary.appendChild(summaryItem);
  });

  auditDiv.appendChild(summary);

  // Issues section
  if (audit.issues.length > 0) {
    const issuesHeader = document.createElement('div');
    issuesHeader.className = 'wc-a11y-issues-header';
    issuesHeader.textContent = `Issues Found (${audit.issues.length})`;
    auditDiv.appendChild(issuesHeader);

    const issuesList = document.createElement('div');
    issuesList.className = 'wc-a11y-issues-list';

    audit.issues.forEach((issue) => {
      const issueEl = createAccessibilityIssueElement(issue);
      issuesList.appendChild(issueEl);
    });

    auditDiv.appendChild(issuesList);
  } else {
    const noIssues = document.createElement('div');
    noIssues.className = 'wc-a11y-no-issues';
    noIssues.textContent = '✓ No accessibility issues detected';
    auditDiv.appendChild(noIssues);
  }

  return auditDiv;
}

/**
 * Create accessibility issue element
 */
function createAccessibilityIssueElement(issue: A11yIssue): HTMLDivElement {
  const issueDiv = document.createElement('div');
  issueDiv.className = `wc-a11y-issue wc-a11y-issue-${issue.type}`;

  const issueHeader = document.createElement('div');
  issueHeader.className = 'wc-a11y-issue-header';

  const typeIcon = document.createElement('span');
  typeIcon.className = `wc-a11y-issue-icon wc-a11y-issue-icon-${issue.type}`;
  typeIcon.textContent = getIssueIcon(issue.type);
  issueHeader.appendChild(typeIcon);

  const categoryBadge = document.createElement('span');
  categoryBadge.className = 'wc-a11y-category-badge';
  categoryBadge.textContent = issue.category.toUpperCase();
  issueHeader.appendChild(categoryBadge);

  if (issue.wcagLevel) {
    const wcagBadge = document.createElement('span');
    wcagBadge.className = 'wc-a11y-wcag-badge';
    wcagBadge.textContent = `WCAG ${issue.wcagLevel}`;
    issueHeader.appendChild(wcagBadge);
  }

  issueDiv.appendChild(issueHeader);

  const issueMessage = document.createElement('div');
  issueMessage.className = 'wc-a11y-issue-message';
  issueMessage.textContent = issue.message;
  issueDiv.appendChild(issueMessage);

  if (issue.recommendation) {
    const recommendation = document.createElement('div');
    recommendation.className = 'wc-a11y-issue-recommendation';
    recommendation.innerHTML = `<strong>Recommendation:</strong> ${issue.recommendation}`;
    issueDiv.appendChild(recommendation);
  }

  // Add highlight button if element is provided
  if (issue.element) {
    const highlightBtn = document.createElement('button');
    highlightBtn.className = 'wc-a11y-highlight-btn';
    highlightBtn.textContent = 'Highlight Element';
    highlightBtn.addEventListener('click', () => {
      highlightElement(issue.element!);
      setTimeout(() => unhighlightElement(issue.element!), 2000);
    });
    issueDiv.appendChild(highlightBtn);
  }

  return issueDiv;
}

/**
 * Create accessibility tree view element
 */
export function createAccessibilityTreeElement(tree: A11yTreeNode): HTMLDivElement {
  const treeDiv = document.createElement('div');
  treeDiv.className = 'wc-a11y-tree';

  const header = document.createElement('div');
  header.className = 'wc-a11y-tree-header';
  header.textContent = 'Accessibility Tree';
  treeDiv.appendChild(header);

  const treeContent = document.createElement('div');
  treeContent.className = 'wc-a11y-tree-content';

  const treeNodes = createAccessibilityTreeNodes(tree, 0);
  treeContent.appendChild(treeNodes);

  treeDiv.appendChild(treeContent);

  return treeDiv;
}

/**
 * Create tree nodes recursively
 */
function createAccessibilityTreeNodes(node: A11yTreeNode, depth: number): HTMLDivElement {
  const nodeDiv = document.createElement('div');
  nodeDiv.className = 'wc-a11y-tree-node';
  nodeDiv.style.paddingLeft = `${depth * 20}px`;

  // Node header
  const nodeHeader = document.createElement('div');
  nodeHeader.className = 'wc-a11y-tree-node-header';

  // Expand/collapse icon if has children
  if (node.children.length > 0) {
    const expandIcon = document.createElement('span');
    expandIcon.className = 'wc-a11y-tree-expand-icon';
    expandIcon.textContent = '▼';
    nodeHeader.appendChild(expandIcon);

    nodeHeader.style.cursor = 'pointer';
    let isExpanded = true;

    nodeHeader.addEventListener('click', () => {
      isExpanded = !isExpanded;
      expandIcon.textContent = isExpanded ? '▼' : '▶';
      childrenDiv.style.display = isExpanded ? 'block' : 'none';
    });
  } else {
    const spacer = document.createElement('span');
    spacer.className = 'wc-a11y-tree-spacer';
    nodeHeader.appendChild(spacer);
  }

  // Role
  const roleSpan = document.createElement('span');
  roleSpan.className = 'wc-a11y-tree-role';
  roleSpan.textContent = node.role || 'generic';
  nodeHeader.appendChild(roleSpan);

  // Name
  if (node.name) {
    const nameSpan = document.createElement('span');
    nameSpan.className = 'wc-a11y-tree-name';
    nameSpan.textContent = `"${node.name}"`;
    nodeHeader.appendChild(nameSpan);
  }

  // Focusable indicator
  if (node.isFocusable) {
    const focusIcon = document.createElement('span');
    focusIcon.className = 'wc-a11y-tree-focus-icon';
    focusIcon.textContent = '⌨️';
    focusIcon.title = 'Focusable';
    nodeHeader.appendChild(focusIcon);
  }

  // Hidden indicator
  if (node.isHidden) {
    const hiddenIcon = document.createElement('span');
    hiddenIcon.className = 'wc-a11y-tree-hidden-icon';
    hiddenIcon.textContent = '👁️‍🗨️';
    hiddenIcon.title = 'Hidden from accessibility tree';
    nodeHeader.appendChild(hiddenIcon);
  }

  nodeDiv.appendChild(nodeHeader);

  // Node details (ARIA properties and states)
  const hasDetails =
    node.ariaProperties.size > 0 ||
    node.ariaStates.size > 0 ||
    node.description ||
    node.tabIndex !== null;

  if (hasDetails) {
    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'wc-a11y-tree-node-details';
    detailsDiv.style.paddingLeft = '24px';

    if (node.description) {
      const descDiv = document.createElement('div');
      descDiv.className = 'wc-a11y-tree-detail';
      descDiv.innerHTML = `<span class="wc-a11y-detail-label">Description:</span> ${node.description}`;
      detailsDiv.appendChild(descDiv);
    }

    if (node.tabIndex !== null) {
      const tabDiv = document.createElement('div');
      tabDiv.className = 'wc-a11y-tree-detail';
      tabDiv.innerHTML = `<span class="wc-a11y-detail-label">tabindex:</span> ${node.tabIndex}`;
      detailsDiv.appendChild(tabDiv);
    }

    // ARIA states
    if (node.ariaStates.size > 0) {
      node.ariaStates.forEach((value, name) => {
        const stateDiv = document.createElement('div');
        stateDiv.className = 'wc-a11y-tree-detail wc-a11y-state';
        stateDiv.innerHTML = `<span class="wc-a11y-detail-label">${name}:</span> ${value}`;
        detailsDiv.appendChild(stateDiv);
      });
    }

    // ARIA properties
    if (node.ariaProperties.size > 0) {
      node.ariaProperties.forEach((value, name) => {
        const propDiv = document.createElement('div');
        propDiv.className = 'wc-a11y-tree-detail wc-a11y-property';
        propDiv.innerHTML = `<span class="wc-a11y-detail-label">${name}:</span> ${value}`;
        detailsDiv.appendChild(propDiv);
      });
    }

    nodeDiv.appendChild(detailsDiv);
  }

  // Children
  const childrenDiv = document.createElement('div');
  childrenDiv.className = 'wc-a11y-tree-children';

  node.children.forEach((child) => {
    const childNode = createAccessibilityTreeNodes(child, depth + 1);
    childrenDiv.appendChild(childNode);
  });

  nodeDiv.appendChild(childrenDiv);

  return nodeDiv;
}

/**
 * Get score class for styling
 */
function getScoreClass(score: number): string {
  if (score >= 90) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'fair';
  return 'poor';
}

/**
 * Get score description
 */
function getScoreDescription(score: number): string {
  if (score >= 90) return 'Excellent accessibility';
  if (score >= 70) return 'Good accessibility with minor issues';
  if (score >= 50) return 'Fair accessibility with some issues';
  return 'Poor accessibility, needs improvement';
}

/**
 * Get issue icon
 */
function getIssueIcon(type: string): string {
  switch (type) {
    case 'error':
      return '❌';
    case 'warning':
      return '⚠️';
    case 'info':
      return 'ℹ️';
    default:
      return '•';
  }
}
