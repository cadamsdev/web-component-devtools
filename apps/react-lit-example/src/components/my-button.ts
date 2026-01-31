import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('my-button')
export class MyButton extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
    }

    button {
      padding: 12px 24px;
      font-size: 16px;
      font-weight: 600;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-family: inherit;
    }

    button:not(:disabled) {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    button:not(:disabled):hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    button:disabled {
      background: #e2e8f0;
      color: #a0aec0;
      cursor: not-allowed;
    }

    button:active:not(:disabled) {
      transform: translateY(0);
    }
  `;

  @property({ type: String })
  label = 'Button';

  @property({ type: Boolean })
  disabled = false;

  @property({ type: String })
  variant = 'primary';

  private _handleClick() {
    this.dispatchEvent(new CustomEvent('button-click', {
      detail: { label: this.label },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    return html`
      <button 
        ?disabled=${this.disabled}
        @click=${this._handleClick}
      >
        ${this.label}
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-button': MyButton;
  }
}
