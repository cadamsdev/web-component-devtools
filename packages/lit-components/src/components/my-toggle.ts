import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('my-toggle')
export class MyToggle extends LitElement {
  @property({ type: Boolean, reflect: true })
  checked = false;

  @property({ type: Boolean })
  disabled = false;

  @property({ type: String })
  label = '';

  @property({ type: String })
  size: 'small' | 'medium' | 'large' = 'medium';

  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      font-family: system-ui, -apple-system, sans-serif;
      cursor: pointer;
      user-select: none;
    }

    :host([disabled]) {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .label {
      font-size: 14px;
      color: #2d3748;
      font-weight: 500;
    }

    .toggle-container {
      position: relative;
      display: inline-block;
    }

    .toggle-track {
      width: var(--track-width);
      height: var(--track-height);
      background: #cbd5e0;
      border-radius: 999px;
      transition: background 0.2s ease;
    }

    :host([checked]) .toggle-track {
      background: #667eea;
    }

    :host([disabled]) .toggle-track {
      background: #e2e8f0;
    }

    .toggle-thumb {
      position: absolute;
      top: 2px;
      left: 2px;
      width: var(--thumb-size);
      height: var(--thumb-size);
      background: white;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      transition: transform 0.2s ease;
    }

    :host([checked]) .toggle-thumb {
      transform: translateX(var(--thumb-translate));
    }

    :host([size='small']) {
      --track-width: 32px;
      --track-height: 18px;
      --thumb-size: 14px;
      --thumb-translate: 14px;
    }

    :host([size='medium']) {
      --track-width: 44px;
      --track-height: 24px;
      --thumb-size: 20px;
      --thumb-translate: 20px;
    }

    :host([size='large']) {
      --track-width: 56px;
      --track-height: 30px;
      --thumb-size: 26px;
      --thumb-translate: 26px;
    }

    input {
      position: absolute;
      opacity: 0;
      pointer-events: none;
    }
  `;

  private handleClick() {
    if (this.disabled) return;

    this.checked = !this.checked;
    this.dispatchEvent(
      new CustomEvent('toggle-change', {
        detail: { checked: this.checked },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    return html`
      <div class="toggle-container" @click=${this.handleClick}>
        <div class="toggle-track">
          <div class="toggle-thumb"></div>
        </div>
        <input
          type="checkbox"
          ?checked=${this.checked}
          ?disabled=${this.disabled}
          aria-hidden="true"
        />
      </div>
      ${this.label ? html`<span class="label">${this.label}</span>` : ''}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-toggle': MyToggle;
  }
}
