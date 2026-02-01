import { useRef } from 'react';
import {
  MyButton,
  MyCard,
  MyCounter,
  MyBadge,
  MyProductCard,
  MyUserProfile,
  MyModal,
  MyTabs,
  MyFormField,
} from '@web-component-dev-tools/react-lit-components';
import './App.css';

function App() {
  const modalRef = useRef<any>(null);

  const handleButtonClick = (e: Event) => {
    const customEvent = e as CustomEvent;
    console.log('Button clicked:', customEvent.detail);
    alert(`Button clicked: ${customEvent.detail.label}`);
  };

  const handleCounterChange = (e: Event) => {
    const customEvent = e as CustomEvent;
    console.log('Counter changed:', customEvent.detail);
  };

  const handleAddToCart = (e: Event) => {
    const customEvent = e as CustomEvent;
    console.log('Add to cart:', customEvent.detail);
    showNotification('success', 'Added to Cart', `Added ${customEvent.detail.quantity}x ${customEvent.detail.product} to cart`);
  };

  const handleBuyNow = (e: Event) => {
    const customEvent = e as CustomEvent;
    console.log('Buy now:', customEvent.detail);
    showNotification('info', 'Processing...', `Processing purchase of ${customEvent.detail.product}`);
  };

  const handleFollow = (e: Event) => {
    const customEvent = e as CustomEvent;
    console.log('Follow:', customEvent.detail);
    showNotification('success', 'Following!', `You are now following ${customEvent.detail.userName}`);
  };

  const handleMessage = (e: Event) => {
    const customEvent = e as CustomEvent;
    console.log('Message:', customEvent.detail);
    alert(`Send message to ${customEvent.detail.userName}`);
  };

  const showNotification = (variant: string, title: string, message: string) => {
    const notification = document.createElement('my-notification') as any;
    notification.setAttribute('variant', variant);
    notification.setAttribute('title', title);
    notification.setAttribute('message', message);
    notification.setAttribute('duration', '5000');
    document.body.appendChild(notification);
  };

  const openModal = () => {
    if (modalRef.current) {
      modalRef.current.show();
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Vite + React + Lit Demo</h1>
        <p className="subtitle">Advanced web components with composition patterns</p>
        <div className="badges">
          <MyBadge label="React" variant="primary" />
          <MyBadge label="Lit" variant="info" />
          <MyBadge label="Vite" variant="success" />
          <MyBadge label="TypeScript" variant="warning" />
        </div>
      </header>

      <main className="main">
        {/* Nested Components Demo */}
        <section className="section">
          <h2>🎨 Complex Components (Using Nested Web Components)</h2>
          <p style={{ color: '#718096', marginBottom: '20px' }}>
            These components use other web components inside them, demonstrating composition patterns.
          </p>
          
          <div style={{ marginBottom: '32px' }}>
            <h3>Product Card (uses Badge, Button, Counter)</h3>
            <div className="grid">
              <MyProductCard
                productName="Wireless Headphones"
                description="Premium noise-cancelling headphones with 30-hour battery life"
                price={299.99}
                currency="$"
                rating={4.5}
                reviewCount={234}
                inStock={true}
                onSale={true}
                newArrival={true}
                initialQuantity={1}
                maxQuantity={5}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
              />
              
              <MyProductCard
                productName="Smart Watch"
                description="Track your fitness with advanced health monitoring features"
                price={399.99}
                currency="$"
                rating={4.8}
                reviewCount={567}
                inStock={true}
                newArrival={true}
                initialQuantity={1}
                maxQuantity={3}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
              />
              
              <MyProductCard
                productName="Laptop Stand"
                description="Ergonomic aluminum stand for your laptop"
                price={49.99}
                currency="$"
                rating={4.2}
                reviewCount={89}
                inStock={false}
                onSale={false}
                initialQuantity={1}
                maxQuantity={10}
              />
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h3>User Profile (uses Badge, Button)</h3>
            <div className="grid">
              <MyUserProfile
                userName="Sarah Johnson"
                userTitle="Senior Software Engineer"
                bio="Passionate about web components and modern web development. Building scalable UI libraries."
                avatarUrl=""
                skills={['React', 'TypeScript', 'Lit', 'Web Components', 'Node.js']}
                followers={1250}
                following={432}
                posts={89}
                verified={true}
                online={true}
                email="sarah@example.com"
                location="San Francisco, CA"
                website="sarahjohnson.dev"
                onFollow={handleFollow}
                onMessage={handleMessage}
              />
              
              <MyUserProfile
                userName="Alex Chen"
                userTitle="UX Designer"
                bio="Creating beautiful and intuitive user experiences. Coffee enthusiast ☕"
                avatarUrl=""
                skills={['Figma', 'UI/UX', 'Design Systems']}
                followers={2800}
                following={567}
                posts={156}
                verified={true}
                online={false}
                location="New York, NY"
                website="alexchen.design"
                onFollow={handleFollow}
                onMessage={handleMessage}
              />
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h3>Tabs Component (uses Badge)</h3>
            <MyTabs
              tabs={[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'messages', label: 'Messages', icon: '💬', count: 5 },
                { id: 'notifications', label: 'Notifications', icon: '🔔', count: 12 },
                { id: 'settings', label: 'Settings', icon: '⚙️' },
                { id: 'premium', label: 'Premium', icon: '⭐', badge: { label: 'New', variant: 'warning' } },
              ]}
              activeTab="overview"
            >
              <div slot="overview">
                <h4>Overview</h4>
                <p>Welcome to your dashboard! Here you can see a summary of your account activity.</p>
                <MyCard title="Statistics">
                  <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                    <MyBadge label="42 Projects" variant="primary" />
                    <MyBadge label="98% Complete" variant="success" />
                  </div>
                </MyCard>
              </div>
              <div slot="messages">
                <h4>Messages</h4>
                <p>You have 5 unread messages.</p>
              </div>
              <div slot="notifications">
                <h4>Notifications</h4>
                <p>You have 12 new notifications.</p>
              </div>
              <div slot="settings">
                <h4>Settings</h4>
                <p>Manage your account settings and preferences.</p>
              </div>
              <div slot="premium">
                <h4>Premium Features</h4>
                <p>Upgrade to unlock premium features!</p>
                <MyButton label="Upgrade Now" />
              </div>
            </MyTabs>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h3>Form Fields (uses Badge for validation)</h3>
            <div style={{ maxWidth: '600px' }}>
              <MyFormField
                label="Email Address"
                name="email"
                type="email"
                placeholder="your.email@example.com"
                required={true}
                showValidation={true}
                helperText="We'll never share your email with anyone else."
              />
              
              <MyFormField
                label="Username"
                name="username"
                type="text"
                placeholder="Choose a username"
                required={true}
                showValidation={true}
                maxLength={20}
                pattern="^[a-zA-Z0-9_]+$"
                errorMessage="Username can only contain letters, numbers, and underscores"
              />
              
              <MyFormField
                label="Bio"
                name="bio"
                type="textarea"
                placeholder="Tell us about yourself..."
                maxLength={200}
                helperText="Describe yourself in a few words"
              />
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h3>Modal Dialog (uses Button)</h3>
            <MyButton label="Open Modal" onButtonClick={openModal} />
            <MyModal
              ref={modalRef}
              title="Confirm Action"
              size="medium"
              confirmLabel="Confirm"
              cancelLabel="Cancel"
              onModalConfirm={() => {
                showNotification('success', 'Confirmed!', 'Your action was confirmed.');
                if (modalRef.current) modalRef.current.close();
              }}
              onModalCancel={() => {
                showNotification('info', 'Cancelled', 'Action was cancelled.');
              }}
            >
              <p>Are you sure you want to perform this action? This cannot be undone.</p>
              <div style={{ marginTop: '16px' }}>
                <MyBadge label="Important" variant="warning" />
              </div>
            </MyModal>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h3>Notifications (uses Button, Badge)</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <MyButton 
                label="Success Toast" 
                onButtonClick={() => showNotification('success', 'Success!', 'Operation completed successfully')} 
              />
              <MyButton 
                label="Error Toast" 
                onButtonClick={() => showNotification('error', 'Error!', 'Something went wrong')} 
              />
              <MyButton 
                label="Warning Toast" 
                onButtonClick={() => showNotification('warning', 'Warning!', 'Please review your input')} 
              />
              <MyButton 
                label="Info Toast" 
                onButtonClick={() => showNotification('info', 'Info', 'Here is some information')} 
              />
            </div>
          </div>
        </section>

        {/* Basic Components Demo */}
        <section className="section">
          <h2>🧩 Basic Components</h2>
          <div className="grid">
            <MyCard
              title="Button Component"
              description="Interactive buttons with various states and styles"
            >
              <div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <MyButton label="Click Me" onButtonClick={handleButtonClick} />
                <MyButton label="Disabled" disabled />
                <MyButton label="Primary" variant="primary" />
              </div>
              <span slot="footer">
                <MyBadge label="Interactive" variant="success" />
              </span>
            </MyCard>

            <MyCard
              title="Counter Component"
              description="Stateful counter with min/max constraints"
            >
              <div style={{ marginTop: '16px' }}>
                <MyCounter
                  value={5}
                  min={0}
                  max={10}
                  label="Items"
                  onCounterChange={handleCounterChange}
                />
              </div>
              <span slot="footer">
                <MyBadge label="Stateful" variant="info" />
              </span>
            </MyCard>

            <MyCard
              title="Badge Component"
              description="Small labels for status and categories"
            >
              <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <MyBadge label="New" variant="primary" />
                <MyBadge label="Active" variant="success" />
                <MyBadge label="Pending" variant="warning" />
                <MyBadge label="Error" variant="danger" />
              </div>
              <span slot="footer">
                <MyBadge label="Visual" variant="primary" />
              </span>
            </MyCard>
          </div>
        </section>

        <section className="section">
          <h2>🔧 Try the Dev Tools</h2>
          <MyCard
            title="Web Component Inspector"
            description="Click the purple lightning button in the bottom-right corner to inspect all web components on this page!"
            elevated
          >
            <div style={{ marginTop: '16px' }}>
              <p style={{ margin: 0, color: '#4a5568', fontSize: '14px' }}>
                The dev tools will show you:
              </p>
              <ul style={{ marginTop: '8px', color: '#4a5568', fontSize: '14px' }}>
                <li>All web components used on the page (including nested ones!)</li>
                <li>Number of instances for each component</li>
                <li>Attributes and properties used by each component</li>
                <li>Real-time updates as components change</li>
              </ul>
            </div>
            <span slot="footer">
              <MyBadge label="Dev Tools" variant="info" />
            </span>
          </MyCard>
        </section>
      </main>

      <footer className="footer">
        <p>Built with React, Lit, and Vite</p>
        <p style={{ fontSize: '14px', color: '#718096' }}>
          Open the dev tools panel to inspect all web components and see composition patterns!
        </p>
      </footer>
    </div>
  );
}

export default App;
