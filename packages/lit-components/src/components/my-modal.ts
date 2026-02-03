import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './my-button.js';

/**
 * A modal dialog component that uses buttons for actions.
 * Demonstrates portal-like behavior and event handling with nested components.
 */
@customElement('my-modal')
export class MyModal extends LitElement {
  static styles = css`
    :host {
      display: none;
    }

    :host([open]) {
      display: block;
    }

    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      z-index: 9998;
      animation: fadeIn 0.2s ease;
    }

    .modal {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      z-index: 9999;
      max-width: 90vw;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      animation: slideIn 0.3s ease;
    }

    .modal.small {
      width: 400px;
    }

    .modal.medium {
      width: 600px;
    }

    .modal.large {
      width: 800px;
    }

    .modal-header {
      padding: 24px;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-title {
      font-size: 24px;
      font-weight: 700;
      color: #2d3748;
      margin: 0;
    }

    .close-button {
      background: none;
      border: none;
      font-size: 24px;
      color: #718096;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
      transition: background 0.2s ease;
    }

    .close-button:hover {
      background: #f7fafc;
    }

    .modal-body {
      padding: 24px;
      overflow-y: auto;
      flex: 1;
    }

    .modal-footer {
      padding: 16px 24px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translate(-50%, -48%);
      }
      to {
        opacity: 1;
        transform: translate(-50%, -50%);
      }
    }
  `;

  @property({ type: Boolean, reflect: true })
  open = false;

  @property({ type: String })
  title = 'Modal Title';

  @property({ type: String })
  size: 'small' | 'medium' | 'large' = 'medium';

  @property({ type: Boolean })
  showFooter = true;

  @property({ type: String })
  confirmLabel = 'Confirm';

  @property({ type: String })
  cancelLabel = 'Cancel';

  @property({ type: Boolean })
  closeOnOverlayClick = true;

  @property({ type: Boolean })
  showCloseButton = true;

  private _handleOverlayClick = (e: MouseEvent) => {
    if (this.closeOnOverlayClick && e.target === e.currentTarget) {
      this.close();
    }
  };

  private _handleClose = () => {
    this.close();
  };

  private _handleCancel = () => {
    this.dispatchEvent(
      new CustomEvent('modal-cancel', {
        bubbles: true,
        composed: true,
      }),
    );
    this.close();
  };

  private _handleConfirm = () => {
    this.dispatchEvent(
      new CustomEvent('modal-confirm', {
        bubbles: true,
        composed: true,
      }),
    );
  };

  public close() {
    this.open = false;
    this.dispatchEvent(
      new CustomEvent('modal-close', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  public show() {
    this.open = true;
    this.dispatchEvent(
      new CustomEvent('modal-open', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  connectedCallback() {
    super.connectedCallback();
    // Add escape key listener - already an arrow function
    document.addEventListener('keydown', this._handleKeyDown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this._handleKeyDown);
  }

  private _handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.open) {
      this.close();
    }
  };

  render() {
    if (!this.open) {
      return html``;
    }

    return html`
      <div class="overlay" @click="${this._handleOverlayClick}">
        <div class="modal ${this.size}">
          <div class="modal-header">
            <h2 class="modal-title">${this.title}</h2>
            ${
              this.showCloseButton
                ? html`
                <button class="close-button" @click="${this._handleClose}">
                  ×
                </button>
              `
                : ''
            }
          </div>
          
          <div class="modal-body">
            <slot></slot>
          </div>
          
          ${
            this.showFooter
              ? html`
              <div class="modal-footer">
                <my-button
                  label="${this.cancelLabel}"
                  @button-click="${this._handleCancel}"
                ></my-button>
                <my-button
                  label="${this.confirmLabel}"
                  @button-click="${this._handleConfirm}"
                ></my-button>
              </div>
            `
              : ''
          }
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-modal': MyModal;
  }
}
