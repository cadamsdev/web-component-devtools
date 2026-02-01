import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import './my-badge.js';
import './my-button.js';

/**
 * A notification/toast component that uses buttons and badges.
 * Demonstrates auto-dismiss, animations, and multiple action buttons.
 */
@customElement('my-notification')
export class MyNotification extends LitElement {
  static styles = css`
    :host {
      display: block;
      position: fixed;
      z-index: 10000;
    }
    
    :host([position='top-right']) {
      top: 20px;
      right: 20px;
    }
    
    :host([position='top-left']) {
      top: 20px;
      left: 20px;
    }
    
    :host([position='bottom-right']) {
      bottom: 20px;
      right: 20px;
    }
    
    :host([position='bottom-left']) {
      bottom: 20px;
      left: 20px;
    }
    
    :host([position='top-center']) {
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
    }
    
    :host([position='bottom-center']) {
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
    }
    
    .notification {
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      min-width: 300px;
      max-width: 500px;
      overflow: hidden;
      animation: slideIn 0.3s ease;
    }
    
    .notification.dismissing {
      animation: slideOut 0.3s ease forwards;
    }
    
    .notification-header {
      padding: 16px;
      display: flex;
      align-items: start;
      gap: 12px;
      border-left: 4px solid;
    }
    
    .notification.success .notification-header {
      border-left-color: #48bb78;
      background: #f0fff4;
    }
    
    .notification.error .notification-header {
      border-left-color: #e53e3e;
      background: #fff5f5;
    }
    
    .notification.warning .notification-header {
      border-left-color: #f6ad55;
      background: #fffaf0;
    }
    
    .notification.info .notification-header {
      border-left-color: #667eea;
      background: #f0f4ff;
    }
    
    .icon {
      font-size: 24px;
      flex-shrink: 0;
    }
    
    .content {
      flex: 1;
      min-width: 0;
    }
    
    .title-row {
      display: flex;
      justify-content: space-between;
      align-items: start;
      gap: 8px;
      margin-bottom: 4px;
    }
    
    .title {
      font-size: 16px;
      font-weight: 700;
      color: #2d3748;
      margin: 0;
    }
    
    .close-button {
      background: none;
      border: none;
      font-size: 20px;
      color: #718096;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: background 0.2s ease;
    }
    
    .close-button:hover {
      background: rgba(0, 0, 0, 0.05);
    }
    
    .message {
      font-size: 14px;
      color: #4a5568;
      line-height: 1.5;
      margin: 0;
    }
    
    .badges {
      display: flex;
      gap: 6px;
      margin-top: 8px;
      flex-wrap: wrap;
    }
    
    .actions {
      padding: 12px 16px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }
    
    .progress-bar {
      height: 3px;
      background: #e2e8f0;
      position: relative;
      overflow: hidden;
    }
    
    .progress-fill {
      height: 100%;
      background: currentColor;
      transition: width 0.1s linear;
    }
    
    .notification.success .progress-fill {
      color: #48bb78;
    }
    
    .notification.error .progress-fill {
      color: #e53e3e;
    }
    
    .notification.warning .progress-fill {
      color: #f6ad55;
    }
    
    .notification.info .progress-fill {
      color: #667eea;
    }
    
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes slideOut {
      from {
        opacity: 1;
        transform: translateY(0);
      }
      to {
        opacity: 0;
        transform: translateY(-20px);
      }
    }
  `;

  @property({ type: String })
  title = 'Notification';

  @property({ type: String })
  message = '';

  @property({ type: String })
  variant: 'success' | 'error' | 'warning' | 'info' = 'info';

  @property({ type: String, reflect: true })
  position:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'top-center'
    | 'bottom-center' = 'top-right';

  @property({ type: Number })
  duration = 5000; // 0 = no auto-dismiss

  @property({ type: Boolean })
  showClose = true;

  @property({ type: Array })
  actions: Array<{
    label: string;
    handler: () => void;
  }> = [];

  @property({ type: Array })
  badges: Array<{
    label: string;
    variant: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  }> = [];

  @property({ type: Boolean })
  showProgress = true;

  @state()
  private _visible = true;

  @state()
  private _dismissing = false;

  @state()
  private _progress = 100;

  private _timer?: number;
  private _progressInterval?: number;

  connectedCallback() {
    super.connectedCallback();
    if (this.duration > 0) {
      this._startAutoDismiss();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._clearTimers();
  }

  private _startAutoDismiss() {
    const progressStep = 100 / (this.duration / 100);

    this._progressInterval = window.setInterval(() => {
      this._progress -= progressStep;
      if (this._progress <= 0) {
        this._progress = 0;
        this._clearTimers();
      }
    }, 100);

    this._timer = window.setTimeout(() => {
      this.dismiss();
    }, this.duration);
  }

  private _clearTimers() {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = undefined;
    }
    if (this._progressInterval) {
      clearInterval(this._progressInterval);
      this._progressInterval = undefined;
    }
  }

  private _handleClose = () => {
    this.dismiss();
  };

  private _handleAction(action: { label: string; handler: () => void }) {
    action.handler();
    this.dispatchEvent(
      new CustomEvent('notification-action', {
        detail: { action: action.label },
        bubbles: true,
        composed: true,
      }),
    );
  }

  public dismiss() {
    this._dismissing = true;
    this._clearTimers();

    setTimeout(() => {
      this._visible = false;
      this.dispatchEvent(
        new CustomEvent('notification-dismiss', {
          bubbles: true,
          composed: true,
        }),
      );
      // Remove from DOM
      this.remove();
    }, 300);
  }

  private _getIcon() {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ',
    };
    return icons[this.variant];
  }

  render() {
    if (!this._visible) {
      return html`
        
      `;
    }

    return html`
      <div class="notification ${this.variant} ${this._dismissing ? 'dismissing' : ''}">
        <div class="notification-header">
          <span class="icon">${this._getIcon()}</span>
          <div class="content">
            <div class="title-row">
              <h4 class="title">${this.title}</h4>
              ${
                this.showClose
                  ? html`
                  <button class="close-button" @click="${this._handleClose}">
                    ×
                  </button>
                `
                  : ''
              }
            </div>
            ${this.message ? html`<p class="message">${this.message}</p>` : ''}
            ${
              this.badges.length > 0
                ? html`
                <div class="badges">
                  ${this.badges.map(
                    (badge) => html`
                      <my-badge
                        label="${badge.label}"
                        variant="${badge.variant}"
                      ></my-badge>
                    `,
                  )}
                </div>
              `
                : ''
            }
          </div>
        </div>
        
        ${
          this.actions.length > 0
            ? html`
            <div class="actions">
              ${this.actions.map(
                (action) => html`
                  <my-button
                    label="${action.label}"
                    @button-click="${() => this._handleAction(action)}"
                  ></my-button>
                `,
              )}
            </div>
          `
            : ''
        }
        
        ${
          this.showProgress && this.duration > 0
            ? html`
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${this._progress}%"></div>
            </div>
          `
            : ''
        }
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-notification': MyNotification;
  }
}
