import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('my-accordion')
export class MyAccordion extends LitElement {
  @property({ type: String })
  title = '';

  @property({ type: Boolean, reflect: true })
  open = false;

  @property({ type: Boolean })
  disabled = false;

  @property({ type: String })
  icon = '▶';

  @state()
  private _contentHeight = 'auto';

  static styles = css`
    :host {
      display: block;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
      font-family:
        system-ui,
        -apple-system,
        sans-serif;
    }

    :host([disabled]) {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      background: #f7fafc;
      cursor: pointer;
      user-select: none;
      transition: background 0.2s ease;
    }

    .header:hover:not(.disabled) {
      background: #edf2f7;
    }

    .header.disabled {
      cursor: not-allowed;
    }

    .title {
      font-size: 16px;
      font-weight: 600;
      color: #2d3748;
      flex: 1;
    }

    .icon {
      font-size: 12px;
      color: #718096;
      transition: transform 0.3s ease;
      margin-left: 12px;
    }

    :host([open]) .icon {
      transform: rotate(90deg);
    }

    .content-wrapper {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease;
    }

    :host([open]) .content-wrapper {
      max-height: var(--content-height, 500px);
    }

    .content {
      padding: 16px;
      color: #4a5568;
      line-height: 1.6;
    }
  `;

  private handleToggle() {
    if (this.disabled) return;

    this.open = !this.open;
    this.dispatchEvent(
      new CustomEvent('accordion-toggle', {
        detail: { open: this.open },
        bubbles: true,
        composed: true,
      }),
    );
  }

  render() {
    return html`
      <div class="header ${this.disabled ? 'disabled' : ''}" @click=${this.handleToggle}>
        <span class="title">${this.title}</span>
        <span class="icon">${this.icon}</span>
      </div>
      <div class="content-wrapper">
        <div class="content">
          <slot></slot>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-accordion': MyAccordion;
  }
}
