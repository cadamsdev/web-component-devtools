import { MyButton, MyCard, MyCounter, MyBadge } from '@web-component-dev-tools/react-lit-components';
import './App.css';

function App() {
  const handleButtonClick = (e: Event) => {
    const customEvent = e as CustomEvent;
    console.log('Button clicked:', customEvent.detail);
    alert(`Button clicked: ${customEvent.detail.label}`);
  };

  const handleCounterChange = (e: Event) => {
    const customEvent = e as CustomEvent;
    console.log('Counter changed:', customEvent.detail);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🎨 Vite + React + Lit Demo</h1>
        <p className="subtitle">
          Example application showcasing Lit web components in a React app
        </p>
        <div className="badges">
          <MyBadge label="React" variant="primary" />
          <MyBadge label="Lit" variant="info" />
          <MyBadge label="Vite" variant="success" />
          <MyBadge label="TypeScript" variant="warning" />
        </div>
      </header>

      <main className="main">
        <section className="section">
          <h2>📦 Card Components</h2>
          <div className="grid">
            <MyCard
              title="Button Component"
              description="Interactive buttons with various states and styles"
              icon="🔘"
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
              icon="🔢"
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
              icon="🏷️"
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
          <h2>🎯 Try the Dev Tools</h2>
          <MyCard
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
              <MyBadge label="Dev Tools" variant="info" />
            </span>
          </MyCard>
        </section>

        <section className="section">
          <h2>🧪 More Examples</h2>
          <div className="grid">
            <MyCard title="Example 1" icon="⭐">
              <MyCounter value={0} min={0} max={100} label="Stars" />
              <span slot="footer">
                <MyButton label="Star" variant="primary" />
              </span>
            </MyCard>

            <MyCard title="Example 2" icon="❤️">
              <MyCounter value={10} min={0} max={50} label="Likes" />
              <span slot="footer">
                <MyButton label="Like" />
              </span>
            </MyCard>

            <MyCard title="Example 3" icon="🚀">
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <MyBadge label="Fast" variant="success" />
                <MyBadge label="Modern" variant="primary" />
              </div>
              <span slot="footer">
                <MyButton label="Launch" />
              </span>
            </MyCard>
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
