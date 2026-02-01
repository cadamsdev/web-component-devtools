import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './my-badge.js';
import './my-button.js';

/**
 * A user profile component that composes badges and buttons.
 * Shows how to build a complete user profile card with nested components.
 */
@customElement('my-user-profile')
export class MyUserProfile extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
    
    .profile-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      max-width: 400px;
    }
    
    .profile-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 24px 80px;
      position: relative;
    }
    
    .avatar-container {
      position: absolute;
      bottom: -50px;
      left: 50%;
      transform: translateX(-50%);
    }
    
    .avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      border: 4px solid white;
      background: #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 48px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
    }
    
    .profile-body {
      padding: 60px 24px 24px;
      text-align: center;
    }
    
    .name {
      font-size: 24px;
      font-weight: 700;
      color: #2d3748;
      margin: 0 0 8px 0;
    }
    
    .title {
      font-size: 14px;
      color: #718096;
      margin: 0 0 16px 0;
    }
    
    .bio {
      font-size: 14px;
      color: #4a5568;
      line-height: 1.6;
      margin: 0 0 20px 0;
    }
    
    .badges {
      display: flex;
      gap: 8px;
      justify-content: center;
      flex-wrap: wrap;
      margin-bottom: 20px;
    }
    
    .stats {
      display: flex;
      justify-content: space-around;
      padding: 20px 0;
      border-top: 1px solid #e2e8f0;
      border-bottom: 1px solid #e2e8f0;
      margin-bottom: 20px;
    }
    
    .stat {
      text-align: center;
    }
    
    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: #2d3748;
      margin: 0 0 4px 0;
    }
    
    .stat-label {
      font-size: 12px;
      color: #718096;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .actions {
      display: flex;
      gap: 12px;
    }
    
    .actions my-button {
      flex: 1;
    }
    
    .contact-info {
      margin: 20px 0;
      text-align: left;
    }
    
    .contact-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 0;
      font-size: 14px;
      color: #4a5568;
    }
    
    .contact-icon {
      width: 20px;
      text-align: center;
    }
  `;

  @property({ type: String })
  userName = 'John Doe';

  @property({ type: String })
  userTitle = 'Software Engineer';

  @property({ type: String })
  bio = '';

  @property({ type: String })
  avatarUrl = '';

  @property({ type: Array })
  skills: string[] = [];

  @property({ type: Number })
  followers = 0;

  @property({ type: Number })
  following = 0;

  @property({ type: Number })
  posts = 0;

  @property({ type: Boolean })
  verified = false;

  @property({ type: Boolean })
  online = false;

  @property({ type: String })
  email = '';

  @property({ type: String })
  location = '';

  @property({ type: String })
  website = '';

  private _handleFollow() {
    this.dispatchEvent(
      new CustomEvent('follow', {
        detail: { userName: this.userName },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _handleMessage() {
    this.dispatchEvent(
      new CustomEvent('message', {
        detail: { userName: this.userName },
        bubbles: true,
        composed: true,
      }),
    );
  }

  render() {
    return html`
      <div class="profile-card">
        <div class="profile-header">
          <div class="avatar-container">
            <div class="avatar">
              ${this.avatarUrl
                ? html`<img src="${this.avatarUrl}" alt="${this.userName}" />`
                : html`👤`
              }
            </div>
          </div>
        </div>
        
        <div class="profile-body">
          <h2 class="name">
            ${this.userName}
            ${this.verified ? ' ✓' : ''}
          </h2>
          <p class="title">${this.userTitle}</p>
          
          <div class="badges">
            ${this.online
              ? html`<my-badge label="Online" variant="success"></my-badge>`
              : ''
            }
            ${this.verified
              ? html`<my-badge label="Verified" variant="info"></my-badge>`
              : ''
            }
            ${this.skills.slice(0, 3).map(
              (skill) => html`<my-badge label="${skill}" variant="primary"></my-badge>`
            )}
          </div>
          
          ${this.bio ? html`<p class="bio">${this.bio}</p>` : ''}
          
          <div class="stats">
            <div class="stat">
              <div class="stat-value">${this._formatNumber(this.followers)}</div>
              <div class="stat-label">Followers</div>
            </div>
            <div class="stat">
              <div class="stat-value">${this._formatNumber(this.following)}</div>
              <div class="stat-label">Following</div>
            </div>
            <div class="stat">
              <div class="stat-value">${this._formatNumber(this.posts)}</div>
              <div class="stat-label">Posts</div>
            </div>
          </div>
          
          ${this.email || this.location || this.website
            ? html`
              <div class="contact-info">
                ${this.email
                  ? html`
                    <div class="contact-item">
                      <span class="contact-icon">📧</span>
                      <span>${this.email}</span>
                    </div>
                  `
                  : ''
                }
                ${this.location
                  ? html`
                    <div class="contact-item">
                      <span class="contact-icon">📍</span>
                      <span>${this.location}</span>
                    </div>
                  `
                  : ''
                }
                ${this.website
                  ? html`
                    <div class="contact-item">
                      <span class="contact-icon">🌐</span>
                      <span>${this.website}</span>
                    </div>
                  `
                  : ''
                }
              </div>
            `
            : ''
          }
          
          <div class="actions">
            <my-button
              label="Follow"
              @button-click="${this._handleFollow}"
            ></my-button>
            <my-button
              label="Message"
              @button-click="${this._handleMessage}"
            ></my-button>
          </div>
        </div>
      </div>
    `;
  }

  private _formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-user-profile': MyUserProfile;
  }
}
