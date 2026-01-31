import React, { useRef, useEffect } from 'react';
import './components';

// TypeScript declarations for web components in JSX
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'my-button': any;
      'my-card': any;
      'my-counter': any;
      'my-badge': any;
    }
  }
}

function App() {
  const buttonRef = useRef<any>(null);
  const counterRef = useRef<any>(null);

  useEffect(() => {
    // Add event listeners for web component events
    const handleButtonClick = (e: CustomEvent) => {
      console.log('Button clicked:', e.detail);
      alert(`Button clicked: ${e.detail.label}`);
    };

    const handleCounterChange = (e: CustomEvent) => {
      console.log('Counter changed:', e.detail);
    };

    if (buttonRef.current) {
      buttonRef.current.addEventListener('button-click', handleButtonClick);
    }

    if (counterRef.current) {
      counterRef.current.addEventListener('counter-change', handleCounterChange);
    }

    return () => {
      if (buttonRef.current) {
        buttonRef.current.removeEventListener('button-click', handleButtonClick);
      }
      if (counterRef.current) {
        counterRef.current.removeEventListener('counter-change', handleCounterChange);
      }
    };
  }, []);

  return (
    <div className="app">
      <header className="header">
        <h1>🎨 React + Lit Web Components Demo</h1>
        <p className="subtitle">
          Example application showcasing Lit web components in a React app
        </p>
        <div className="badges">
          <my-badge label="React" variant="primary"></my-badge>
          <my-badge label="Lit" variant="info"></my-badge>
          <my-badge label="Vite" variant="success"></my-badge>
          <my-badge label="TypeScript" variant="warning"></my-badge>
        </div>
      </header>

      <main className="main">
        <section className="section">
          <h2>📦 Card Components</h2>
          <div className="grid">
            <my-card
              title="Button Component"
              description="Interactive buttons with various states and styles"
              icon="🔘"
            >
              <div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <my-button ref={buttonRef} label="Click Me"></my-button>
                <my-button label="Disabled" disabled></my-button>
                <my-button label="Primary" variant="primary"></my-button>
              </div>
              <span slot="footer">
                <my-badge label="Interactive" variant="success"></my-badge>
              </span>
            </my-card>

            <my-card
              title="Counter Component"
              description="Stateful counter with min/max constraints"
              icon="🔢"
            >
              <div style={{ marginTop: '16px' }}>
                <my-counter
                  ref={counterRef}
                  value={5}
                  min={0}
                  max={10}
                  label="Items"
                ></my-counter>
              </div>
              <span slot="footer">
                <my-badge label="Stateful" variant="info"></my-badge>
              </span>
            </my-card>

            <my-card
              title="Badge Component"
              description="Small labels for status and categories"
              icon="🏷️"
            >
              <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <my-badge label="New" variant="primary"></my-badge>
                <my-badge label="Active" variant="success"></my-badge>
                <my-badge label="Pending" variant="warning"></my-badge>
                <my-badge label="Error" variant="danger"></my-badge>
              </div>
              <span slot="footer">
                <my-badge label="Visual" variant="primary"></my-badge>
              </span>
            </my-card>
          </div>
        </section>

        <section className="section">
          <h2>🎯 Try the Dev Tools</h2>
          <my-card
            title="Web Component Inspector"
            description="Click the purple lightning button (⚡) in the bottom-right corner to inspect all web components on this page!"
            icon="🔍"
            elevated
          >
            <div style={{ marginTop: '16px' }}>
              <p style={{ margin: 0, color: '#4a5568', fontSize: '14px' }}>
                The dev tools will show you:
              </p>
              <ul style={{ marginTop: '8px', color: '#4a5568', fontSize: '14px' }}>
                <li>All web components used on the page</li>
                <li>Number of instances for each component</li>
                <li>Attributes used by each component</li>
                <li>Real-time updates as components change</li>
              </ul>
            </div>
            <span slot="footer">
              <my-badge label="Dev Tools" variant="info"></my-badge>
            </span>
          </my-card>
        </section>

        <section className="section">
          <h2>🧪 More Examples</h2>
          <div className="grid">
            <my-card title="Example 1" icon="⭐">
              <my-counter value={0} min={0} max={100} label="Stars"></my-counter>
              <span slot="footer">
                <my-button label="Star" variant="primary"></my-button>
              </span>
            </my-card>

            <my-card title="Example 2" icon="❤️">
              <my-counter value={10} min={0} max={50} label="Likes"></my-counter>
              <span slot="footer">
                <my-button label="Like"></my-button>
              </span>
            </my-card>

            <my-card title="Example 3" icon="🚀">
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <my-badge label="Fast" variant="success"></my-badge>
                <my-badge label="Modern" variant="primary"></my-badge>
              </div>
              <span slot="footer">
                <my-button label="Launch"></my-button>
              </span>
            </my-card>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>Built with React, Lit, and Vite</p>
        <p style={{ fontSize: '14px', color: '#718096' }}>
          Open the dev tools panel to inspect the web components!
        </p>
      </footer>
    </div>
  );
}

export default App;
