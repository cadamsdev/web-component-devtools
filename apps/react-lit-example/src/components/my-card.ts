import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('my-card')
export class MyCard extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }

    .card:hover {
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      transform: translateY(-4px);
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
      color: #2d3748;
      margin: 0;
    }

    .card-description {
      color: #4a5568;
      line-height: 1.6;
      margin: 0;
    }

    .card-footer {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
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
  icon = '📦';

  @property({ type: Boolean })
  elevated = false;

  render() {
    return html`
      <div class="card ${this.elevated ? 'elevated' : ''}">
        <div class="card-header">
          <span class="card-icon">${this.icon}</span>
          <h3 class="card-title">${this.title}</h3>
        </div>
        ${this.description ? html`
          <p class="card-description">${this.description}</p>
        ` : ''}
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
