import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('my-button')
export class MyButton extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
      --button-padding: 12px 24px;
      --button-font-size: 16px;
      --button-border-radius: 8px;
      --button-gradient-start: #667eea;
      --button-gradient-end: #764ba2;
      --button-text-color: white;
      --button-hover-lift: -2px;
      --button-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      --button-disabled-bg: #e2e8f0;
      --button-disabled-color: #a0aec0;
    }
    
    button {
      padding: var(--button-padding);
      font-size: var(--button-font-size);
      font-weight: 600;
      border: none;
      border-radius: var(--button-border-radius);
      cursor: pointer;
      transition: all 0.3s ease;
      font-family: inherit;
    }
    
    button:not(:disabled) {
      background: linear-gradient(
        135deg,
        var(--button-gradient-start) 0%,
        var(--button-gradient-end) 100%
      );
      color: var(--button-text-color);
    }
    
    button:not(:disabled):hover {
      transform: translateY(var(--button-hover-lift));
      box-shadow: var(--button-shadow);
    }
    
    button:disabled {
      background: var(--button-disabled-bg);
      color: var(--button-disabled-color);
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
    this.dispatchEvent(
      new CustomEvent('button-click', {
        detail: { label: this.label },
        bubbles: true,
        composed: true,
      }),
    );
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
