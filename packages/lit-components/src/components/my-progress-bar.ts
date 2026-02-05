import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('my-progress-bar')
export class MyProgressBar extends LitElement {
  @property({ type: Number })
  value = 0;

  @property({ type: Number })
  max = 100;

  @property({ type: String })
  label = '';

  @property({ type: String })
  variant: 'default' | 'success' | 'warning' | 'danger' | 'info' = 'default';

  @property({ type: Boolean })
  showPercentage = true;

  @property({ type: Boolean })
  striped = false;

  @property({ type: Boolean })
  animated = false;

  @property({ type: String })
  size: 'small' | 'medium' | 'large' = 'medium';

  static styles = css`
    :host {
      display: block;
      font-family: system-ui, -apple-system, sans-serif;
    }

    .container {
      width: 100%;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .label {
      font-size: 14px;
      font-weight: 500;
      color: #2d3748;
    }

    .percentage {
      font-size: 14px;
      color: #718096;
      font-weight: 500;
    }

    .progress-track {
      width: 100%;
      background: #e2e8f0;
      border-radius: 999px;
      overflow: hidden;
      position: relative;
    }

    :host([size='small']) .progress-track {
      height: 6px;
    }

    :host([size='medium']) .progress-track {
      height: 12px;
    }

    :host([size='large']) .progress-track {
      height: 18px;
    }

    .progress-bar {
      height: 100%;
      border-radius: 999px;
      transition: width 0.3s ease;
      background: var(--progress-color);
    }

    :host([variant='default']) {
      --progress-color: #667eea;
    }

    :host([variant='success']) {
      --progress-color: #48bb78;
    }

    :host([variant='warning']) {
      --progress-color: #ed8936;
    }

    :host([variant='danger']) {
      --progress-color: #f56565;
    }

    :host([variant='info']) {
      --progress-color: #4299e1;
    }

    :host([striped]) .progress-bar {
      background-image: linear-gradient(
        45deg,
        rgba(255, 255, 255, 0.15) 25%,
        transparent 25%,
        transparent 50%,
        rgba(255, 255, 255, 0.15) 50%,
        rgba(255, 255, 255, 0.15) 75%,
        transparent 75%,
        transparent
      );
      background-size: 1rem 1rem;
    }

    :host([animated]) .progress-bar {
      animation: progress-bar-stripes 1s linear infinite;
    }

    @keyframes progress-bar-stripes {
      0% {
        background-position: 1rem 0;
      }
      100% {
        background-position: 0 0;
      }
    }
  `;

  private getPercentage(): number {
    return Math.min(100, Math.max(0, (this.value / this.max) * 100));
  }

  render() {
    const percentage = this.getPercentage();

    return html`
      <div class="container">
        ${this.label || this.showPercentage
          ? html`
              <div class="header">
                ${this.label ? html`<span class="label">${this.label}</span>` : html`<span></span>`}
                ${this.showPercentage
                  ? html`<span class="percentage">${Math.round(percentage)}%</span>`
                  : ''}
              </div>
            `
          : ''}
        <div class="progress-track">
          <div class="progress-bar" style="width: ${percentage}%"></div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-progress-bar': MyProgressBar;
  }
}
