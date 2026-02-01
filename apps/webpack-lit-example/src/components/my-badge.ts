import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('my-badge')
export class MyBadge extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .badge.primary {
      background: #e6f2ff;
      color: #0066cc;
    }

    .badge.success {
      background: #e6ffe6;
      color: #00cc00;
    }

    .badge.warning {
      background: #fff4e6;
      color: #ff9900;
    }

    .badge.danger {
      background: #ffe6e6;
      color: #cc0000;
    }

    .badge.info {
      background: #f0e6ff;
      color: #9900cc;
    }
  `;

  @property({ type: String })
  variant: 'primary' | 'success' | 'warning' | 'danger' | 'info' = 'primary';

  @property({ type: String })
  label = 'Badge';

  render() {
    return html`
      <span class="badge ${this.variant}">
        ${this.label}
      </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-badge': MyBadge;
  }
}
