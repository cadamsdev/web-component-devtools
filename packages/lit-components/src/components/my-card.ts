import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('my-card')
export class MyCard extends LitElement {
  static styles = css`
    :host {
      display: block;
      --card-bg: white;
      --card-border-radius: 12px;
      --card-padding: 24px;
      --card-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      --card-shadow-hover: 0 8px 24px rgba(0, 0, 0, 0.15);
      --card-hover-lift: -4px;
      --card-title-color: #2d3748;
      --card-text-color: #4a5568;
      --card-border-color: #e2e8f0;
    }
    
    .card {
      background: var(--card-bg);
      border-radius: var(--card-border-radius);
      padding: var(--card-padding);
      box-shadow: var(--card-shadow);
    }
    
    .card-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }
    
    .card-icon {
      font-size: 32px;
    }
    
    .card-title {
      font-size: 20px;
      font-weight: 700;
      color: var(--card-title-color);
      margin: 0;
    }
    
    .card-description {
      color: var(--card-text-color);
      line-height: 1.6;
      margin: 0;
    }
    
    .card-footer {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid var(--card-border-color);
    }
    
    ::slotted(*) {
      margin: 0;
    }
  `;

  @property({ type: String })
  title = 'Card Title';

  @property({ type: String })
  description = '';

  @property({ type: String })
  icon = '';

  @property({ type: Boolean })
  elevated = false;

  render() {
    return html`
      <div class="card ${this.elevated ? 'elevated' : ''}">
        <div class="card-header">
          <span class="card-icon">${this.icon}</span>
          <h3 class="card-title">${this.title}</h3>
        </div>
        ${
          this.description
            ? html`
          <p class="card-description">${this.description}</p>
        `
            : ''
        }
        <slot></slot>
        <div class="card-footer">
          <slot name="footer"></slot>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-card': MyCard;
  }
}
