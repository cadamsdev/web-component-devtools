import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './my-badge.js';
import './my-button.js';
import './my-counter.js';

/**
 * A product card component that composes multiple other web components.
 * Demonstrates how to build complex UI from smaller, reusable components.
 */
@customElement('my-product-card')
export class MyProductCard extends LitElement {
  static styles = css`
    :host {
      display: block;
      --product-card-bg: white;
      --product-card-border-radius: 16px;
      --product-card-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .product-card {
      background: var(--product-card-bg);
      border-radius: var(--product-card-border-radius);
      box-shadow: var(--product-card-shadow);
      overflow: hidden;
      transition: box-shadow 0.2s ease;
    }
    
    .product-card:hover {
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }
    
    .image-container {
      position: relative;
      width: 100%;
      height: 240px;
      overflow: hidden;
      background: #f7fafc;
    }
    
    .product-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .badge-container {
      position: absolute;
      top: 12px;
      left: 12px;
      display: flex;
      gap: 8px;
    }
    
    .content {
      padding: 20px;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 12px;
    }
    
    .title {
      font-size: 20px;
      font-weight: 700;
      color: #2d3748;
      margin: 0 0 8px 0;
    }
    
    .price {
      font-size: 24px;
      font-weight: 700;
      color: #667eea;
      margin: 0;
    }
    
    .description {
      color: #4a5568;
      line-height: 1.6;
      margin: 0 0 16px 0;
      font-size: 14px;
    }
    
    .rating {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
    }
    
    .stars {
      color: #fbbf24;
      font-size: 18px;
    }
    
    .rating-text {
      color: #718096;
      font-size: 14px;
    }
    
    .quantity-section {
      margin: 20px 0;
      padding: 16px;
      background: #f7fafc;
      border-radius: 8px;
    }
    
    .quantity-label {
      font-size: 14px;
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 12px;
    }
    
    .actions {
      display: flex;
      gap: 12px;
      margin-top: 20px;
    }
    
    .actions my-button {
      flex: 1;
    }
  `;

  @property({ type: String })
  productName = 'Product Name';

  @property({ type: String })
  description = 'Product description goes here';

  @property({ type: Number })
  price = 0;

  @property({ type: String })
  currency = '$';

  @property({ type: String })
  imageUrl = '';

  @property({ type: Number })
  rating = 0;

  @property({ type: Number })
  reviewCount = 0;

  @property({ type: Boolean })
  inStock = true;

  @property({ type: Boolean })
  onSale = false;

  @property({ type: Boolean })
  newArrival = false;

  @property({ type: Number })
  initialQuantity = 1;

  @property({ type: Number })
  maxQuantity = 10;

  private _handleAddToCart = () => {
    const counter = this.shadowRoot?.querySelector('my-counter');
    const quantity = counter
      ? (counter as any)._count || this.initialQuantity
      : this.initialQuantity;

    this.dispatchEvent(
      new CustomEvent('add-to-cart', {
        detail: {
          product: this.productName,
          quantity,
          price: this.price,
          total: this.price * quantity,
        },
        bubbles: true,
        composed: true,
      }),
    );
  };

  private _handleBuyNow = () => {
    const counter = this.shadowRoot?.querySelector('my-counter');
    const quantity = counter
      ? (counter as any)._count || this.initialQuantity
      : this.initialQuantity;

    this.dispatchEvent(
      new CustomEvent('buy-now', {
        detail: {
          product: this.productName,
          quantity,
          price: this.price,
          total: this.price * quantity,
        },
        bubbles: true,
        composed: true,
      }),
    );
  };

  private _renderStars(rating: number) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return html`
      ${'★'.repeat(fullStars)}${hasHalfStar ? '⯨' : ''}${'☆'.repeat(emptyStars)}
    `;
  }

  render() {
    return html`
      <div class="product-card">
        <div class="image-container">
          ${
            this.imageUrl
              ? html`<img class="product-image" src="${this.imageUrl}" alt="${this.productName}" />`
              : html`
                  <div
                    class="product-image"
                    style="display: flex; align-items: center; justify-content: center; font-size: 48px"
                  >
                    📦
                  </div>
                `
          }
          <div class="badge-container">
            ${
              this.newArrival
                ? html`
                    <my-badge label="New" variant="info"></my-badge>
                  `
                : ''
            }
            ${
              this.onSale
                ? html`
                    <my-badge label="Sale" variant="danger"></my-badge>
                  `
                : ''
            }
            ${
              !this.inStock
                ? html`
                    <my-badge label="Out of Stock" variant="warning"></my-badge>
                  `
                : ''
            }
          </div>
        </div>
        
        <div class="content">
          <div class="header">
            <div>
              <h3 class="title">${this.productName}</h3>
              ${
                this.rating > 0
                  ? html`
                  <div class="rating">
                    <span class="stars">${this._renderStars(this.rating)}</span>
                    <span class="rating-text">${this.rating} (${this.reviewCount} reviews)</span>
                  </div>
                `
                  : ''
              }
            </div>
            <p class="price">${this.currency}${this.price.toFixed(2)}</p>
          </div>
          
          <p class="description">${this.description}</p>
          
          ${
            this.inStock
              ? html`
              <div class="quantity-section">
                <div class="quantity-label">Quantity</div>
                <my-counter
                  value="${this.initialQuantity}"
                  min="1"
                  max="${this.maxQuantity}"
                ></my-counter>
              </div>
              
              <div class="actions">
                <my-button
                  label="Add to Cart"
                  @button-click="${this._handleAddToCart}"
                ></my-button>
                <my-button
                  label="Buy Now"
                  @button-click="${this._handleBuyNow}"
                ></my-button>
              </div>
            `
              : html`
                  <my-button label="Out of Stock" disabled></my-button>
                `
          }
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-product-card': MyProductCard;
  }
}
