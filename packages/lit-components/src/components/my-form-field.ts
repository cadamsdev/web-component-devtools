import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import './my-badge.js';

/**
 * A form field component with validation that uses badges to show status.
 * Demonstrates form handling and validation with nested components.
 */
@customElement('my-form-field')
export class MyFormField extends LitElement {
  static styles = css`
    :host {
      display: block;
      margin-bottom: 20px;
    }
    
    .form-field {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .label-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .label {
      font-size: 14px;
      font-weight: 600;
      color: #2d3748;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .required {
      color: #e53e3e;
    }
    
    .input-wrapper {
      position: relative;
    }
    
    input,
    textarea {
      width: 100%;
      padding: 12px 16px;
      font-size: 14px;
      font-family: inherit;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      transition: all 0.2s ease;
      box-sizing: border-box;
    }
    
    input:focus,
    textarea:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    
    input.error,
    textarea.error {
      border-color: #e53e3e;
    }
    
    input.error:focus,
    textarea.error:focus {
      box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1);
    }
    
    input.success,
    textarea.success {
      border-color: #48bb78;
    }
    
    input:disabled,
    textarea:disabled {
      background: #f7fafc;
      color: #a0aec0;
      cursor: not-allowed;
    }
    
    textarea {
      resize: vertical;
      min-height: 100px;
    }
    
    .input-icon {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 18px;
    }
    
    .helper-text {
      font-size: 12px;
      color: #718096;
      margin: 0;
    }
    
    .error-text {
      font-size: 12px;
      color: #e53e3e;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    .character-count {
      font-size: 12px;
      color: #718096;
      text-align: right;
    }
    
    .character-count.warning {
      color: #f6ad55;
    }
    
    .character-count.error {
      color: #e53e3e;
    }
  `;

  @property({ type: String })
  label = '';

  @property({ type: String })
  name = '';

  @property({ type: String })
  value = '';

  @property({ type: String })
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' = 'text';

  @property({ type: String })
  placeholder = '';

  @property({ type: Boolean })
  required = false;

  @property({ type: Boolean })
  disabled = false;

  @property({ type: String })
  helperText = '';

  @property({ type: String })
  errorMessage = '';

  @property({ type: Number })
  maxLength?: number;

  @property({ type: String })
  pattern?: string;

  @property({ type: Boolean })
  showValidation = false;

  @state()
  private _value = '';

  @state()
  private _error = '';

  @state()
  private _touched = false;

  connectedCallback() {
    super.connectedCallback();
    this._value = this.value;
  }

  private _handleInput = (e: Event) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    this._value = target.value;

    if (this._touched) {
      this._validate();
    }

    this.dispatchEvent(
      new CustomEvent('field-input', {
        detail: {
          name: this.name,
          value: this._value,
          valid: !this._error,
        },
        bubbles: true,
        composed: true,
      }),
    );
  };

  private _handleBlur = () => {
    this._touched = true;
    this._validate();
  };

  private _validate() {
    this._error = '';

    if (this.required && !this._value.trim()) {
      this._error = 'This field is required';
      return;
    }

    if (this.pattern && this._value) {
      const regex = new RegExp(this.pattern);
      if (!regex.test(this._value)) {
        this._error = this.errorMessage || 'Invalid format';
        return;
      }
    }

    if (this.type === 'email' && this._value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this._value)) {
        this._error = 'Invalid email address';
        return;
      }
    }

    if (this.type === 'url' && this._value) {
      try {
        new URL(this._value);
      } catch {
        this._error = 'Invalid URL';
        return;
      }
    }

    if (this.maxLength && this._value.length > this.maxLength) {
      this._error = `Maximum ${this.maxLength} characters allowed`;
      return;
    }

    this.dispatchEvent(
      new CustomEvent('field-valid', {
        detail: {
          name: this.name,
          value: this._value,
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _getInputClass() {
    if (this._error && this._touched) return 'error';
    if (this.showValidation && this._value && !this._error && this._touched) return 'success';
    return '';
  }

  private _getCharacterCountClass() {
    if (!this.maxLength) return '';
    const percentage = (this._value.length / this.maxLength) * 100;
    if (percentage >= 100) return 'error';
    if (percentage >= 90) return 'warning';
    return '';
  }

  render() {
    const showError = this._error && this._touched;
    const showSuccess = this.showValidation && this._value && !this._error && this._touched;

    return html`
      <div class="form-field">
        <div class="label-row">
          <label class="label">
            ${this.label}
            ${
              this.required
                ? html`
                    <span class="required">*</span>
                  `
                : ''
            }
            ${
              showSuccess
                ? html`
                    <my-badge label="Valid" variant="success"></my-badge>
                  `
                : ''
            }
          </label>
          ${
            this.maxLength
              ? html`
              <div class="character-count ${this._getCharacterCountClass()}">
                ${this._value.length}/${this.maxLength}
              </div>
            `
              : ''
          }
        </div>
        
        <div class="input-wrapper">
          ${
            this.type === 'textarea'
              ? html`
              <textarea
                class="${this._getInputClass()}"
                .value="${this._value}"
                placeholder="${this.placeholder}"
                ?disabled="${this.disabled}"
                ?required="${this.required}"
                maxlength="${this.maxLength || ''}"
                @input="${this._handleInput}"
                @blur="${this._handleBlur}"
              ></textarea>
            `
              : html`
              <input
                class="${this._getInputClass()}"
                type="${this.type}"
                .value="${this._value}"
                placeholder="${this.placeholder}"
                ?disabled="${this.disabled}"
                ?required="${this.required}"
                maxlength="${this.maxLength || ''}"
                pattern="${this.pattern || ''}"
                @input="${this._handleInput}"
                @blur="${this._handleBlur}"
              />
            `
          }
          ${
            showSuccess
              ? html`
                  <span class="input-icon">✓</span>
                `
              : ''
          }
          ${
            showError
              ? html`
                  <span class="input-icon">⚠</span>
                `
              : ''
          }
        </div>
        
        ${
          showError
            ? html`
            <p class="error-text">
              <my-badge label="Error" variant="danger"></my-badge>
              ${this._error}
            </p>
          `
            : this.helperText
              ? html`<p class="helper-text">${this.helperText}</p>`
              : ''
        }
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-form-field': MyFormField;
  }
}
