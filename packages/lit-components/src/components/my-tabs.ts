import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import './my-badge.js';

/**
 * A tabs component that uses badges to show notification counts.
 * Demonstrates state management and conditional rendering with nested components.
 */
@customElement('my-tabs')
export class MyTabs extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
    
    .tabs-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    
    .tabs-header {
      display: flex;
      border-bottom: 2px solid #e2e8f0;
      background: #f7fafc;
      overflow-x: auto;
      scrollbar-width: thin;
    }
    
    .tabs-header::-webkit-scrollbar {
      height: 4px;
    }
    
    .tabs-header::-webkit-scrollbar-thumb {
      background: #cbd5e0;
      border-radius: 2px;
    }
    
    .tab {
      padding: 16px 24px;
      cursor: pointer;
      border: none;
      background: none;
      font-family: inherit;
      font-size: 14px;
      font-weight: 600;
      color: #718096;
      border-bottom: 3px solid transparent;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 8px;
      white-space: nowrap;
      position: relative;
    }
    
    .tab:hover {
      color: #4a5568;
      background: #edf2f7;
    }
    
    .tab.active {
      color: #667eea;
      border-bottom-color: #667eea;
      background: white;
    }
    
    .tab-icon {
      font-size: 18px;
    }
    
    .tab-label {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .tabs-content {
      padding: 24px;
    }
    
    .tab-panel {
      display: none;
      animation: fadeIn 0.3s ease;
    }
    
    .tab-panel.active {
      display: block;
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;

  @property({ type: Array })
  tabs: Array<{
    id: string;
    label: string;
    icon?: string;
    count?: number;
    badge?: {
      label: string;
      variant: 'primary' | 'success' | 'warning' | 'danger' | 'info';
    };
  }> = [];

  @property({ type: String })
  activeTab = '';

  @state()
  private _currentTab = '';

  connectedCallback() {
    super.connectedCallback();
    if (!this._currentTab && this.tabs.length > 0) {
      this._currentTab = this.activeTab || this.tabs[0].id;
    }
  }

  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('activeTab') && this.activeTab) {
      this._currentTab = this.activeTab;
    }
  }

  private _handleTabClick(tabId: string) {
    this._currentTab = tabId;
    this.dispatchEvent(
      new CustomEvent('tab-change', {
        detail: { tabId },
        bubbles: true,
        composed: true,
      }),
    );
  }

  render() {
    return html`
      <div class="tabs-container">
        <div class="tabs-header">
          ${this.tabs.map(
            (tab) => html`
              <button
                class="tab ${this._currentTab === tab.id ? 'active' : ''}"
                @click="${() => this._handleTabClick(tab.id)}"
              >
                ${tab.icon ? html`<span class="tab-icon">${tab.icon}</span>` : ''}
                <span class="tab-label">
                  ${tab.label}
                  ${
                    tab.count !== undefined
                      ? html`<my-badge label="${tab.count}" variant="primary"></my-badge>`
                      : ''
                  }
                  ${
                    tab.badge
                      ? html`<my-badge
                        label="${tab.badge.label}"
                        variant="${tab.badge.variant}"
                      ></my-badge>`
                      : ''
                  }
                </span>
              </button>
            `,
          )}
        </div>
        
        <div class="tabs-content">
          ${this.tabs.map(
            (tab) => html`
              <div class="tab-panel ${this._currentTab === tab.id ? 'active' : ''}">
                <slot name="${tab.id}"></slot>
              </div>
            `,
          )}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-tabs': MyTabs;
  }
}
