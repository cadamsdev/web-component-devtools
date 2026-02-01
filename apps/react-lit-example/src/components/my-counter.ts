import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('my-counter')
export class MyCounter extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .counter {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: #f7fafc;
      border-radius: 8px;
      width: fit-content;
    }

    .count {
      font-size: 32px;
      font-weight: 700;
      color: #2d3748;
      min-width: 60px;
      text-align: center;
    }

    button {
      width: 40px;
      height: 40px;
      border: none;
      border-radius: 50%;
      background: #667eea;
      color: white;
      font-size: 20px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    button:hover {
      background: #764ba2;
      transform: scale(1.1);
    }

    button:active {
      transform: scale(0.95);
    }

    .label {
      font-size: 14px;
      color: #718096;
      margin-bottom: 8px;
    }
  `;

  @property({ type: Number })
  value = 0;

  @property({ type: Number })
  min = 0;

  @property({ type: Number })
  max = 100;

  @property({ type: String })
  label = '';

  @state()
  private _count = 0;

  connectedCallback() {
    super.connectedCallback();
    this._count = this.value;
  }

  private _increment() {
    if (this._count < this.max) {
      this._count++;
      this._dispatchChange();
    }
  }

  private _decrement() {
    if (this._count > this.min) {
      this._count--;
      this._dispatchChange();
    }
  }

  private _dispatchChange() {
    this.dispatchEvent(new CustomEvent('counter-change', {
      detail: { value: this._count },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    return html`
      ${this.label ? html`<div class="label">${this.label}</div>` : ''}
      <div class="counter">
        <button @click=${this._decrement} ?disabled=${this._count <= this.min}>−</button>
        <span class="count">${this._count}</span>
        <button @click=${this._increment} ?disabled=${this._count >= this.max}>+</button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-counter': MyCounter;
  }
}
