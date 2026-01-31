import type { Plugin } from 'vite';

export interface WebComponentDevToolsOptions {
  /**
   * Enable the dev tools (default: true in dev mode only)
   */
  enabled?: boolean;
  /**
   * Position of the dev tools button (default: 'bottom-right')
   */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export function webComponentDevTools(options: WebComponentDevToolsOptions = {}): Plugin {
  const { enabled = true, position = 'bottom-right' } = options;
  
  let isDev = false;

  return {
    name: 'vite-web-component-dev-tools',
    
    configResolved(config) {
      isDev = config.mode === 'development';
    },

    transformIndexHtml(html) {
      // Only inject in development mode if enabled
      if (!isDev || !enabled) {
        return html;
      }

      // Inject the dev tools script
      return {
        html,
        tags: [
          {
            tag: 'script',
            attrs: {
              type: 'module',
            },
            children: getDevToolsScript(position),
            injectTo: 'body',
          },
        ],
      };
    },
  };
}

function getDevToolsScript(position: string): string {
  return `
    // Web Component Dev Tools
    (function() {
      const styles = \`
        #wc-devtools-btn {
          position: fixed;
          ${getPositionStyles(position)}
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          z-index: 999999;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          font-size: 24px;
          color: white;
        }
        
        #wc-devtools-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
        }
        
        #wc-devtools-panel {
          position: fixed;
          ${getPositionStyles(position, true)}
          width: 400px;
          max-height: 600px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          z-index: 999998;
          display: none;
          flex-direction: column;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          overflow: hidden;
        }
        
        #wc-devtools-panel.visible {
          display: flex;
        }
        
        .wc-devtools-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 16px;
          font-weight: 600;
          font-size: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .wc-devtools-close {
          background: none;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: background 0.2s;
        }
        
        .wc-devtools-close:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        
        .wc-devtools-content {
          padding: 16px;
          overflow-y: auto;
          flex: 1;
        }
        
        .wc-component {
          background: #f7fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 12px;
        }
        
        .wc-component-name {
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 8px;
          font-size: 14px;
        }
        
        .wc-component-count {
          color: #718096;
          font-size: 12px;
          margin-bottom: 8px;
        }
        
        .wc-component-attributes {
          font-size: 12px;
          color: #4a5568;
        }
        
        .wc-attribute {
          background: white;
          padding: 4px 8px;
          border-radius: 4px;
          margin: 4px 4px 4px 0;
          display: inline-block;
          border: 1px solid #e2e8f0;
        }
        
        .wc-attribute-name {
          color: #805ad5;
          font-weight: 500;
        }
        
        .wc-attribute-value {
          color: #2d3748;
        }
        
        .wc-no-components {
          text-align: center;
          color: #718096;
          padding: 32px;
        }
        
        .wc-stats {
          background: #edf2f7;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 14px;
          color: #2d3748;
        }
      \`;
      
      // Inject styles
      const styleEl = document.createElement('style');
      styleEl.textContent = styles;
      document.head.appendChild(styleEl);
      
      // Create button
      const button = document.createElement('button');
      button.id = 'wc-devtools-btn';
      button.innerHTML = '⚡';
      button.title = 'Web Component Dev Tools';
      
      // Create panel
      const panel = document.createElement('div');
      panel.id = 'wc-devtools-panel';
      panel.innerHTML = \`
        <div class="wc-devtools-header">
          <span>Web Components</span>
          <button class="wc-devtools-close">×</button>
        </div>
        <div class="wc-devtools-content" id="wc-devtools-content">
          Loading...
        </div>
      \`;
      
      document.body.appendChild(button);
      document.body.appendChild(panel);
      
      // Toggle panel
      button.addEventListener('click', () => {
        const isVisible = panel.classList.toggle('visible');
        if (isVisible) {
          updateComponentList();
        }
      });
      
      // Close button
      panel.querySelector('.wc-devtools-close').addEventListener('click', () => {
        panel.classList.remove('visible');
      });
      
      // Function to scan for web components
      function scanWebComponents() {
        const components = new Map();
        
        // Get all custom elements
        const allElements = document.querySelectorAll('*');
        
        allElements.forEach(el => {
          const tagName = el.tagName.toLowerCase();
          
          // Check if it's a custom element (contains hyphen)
          if (tagName.includes('-')) {
            if (!components.has(tagName)) {
              components.set(tagName, {
                name: tagName,
                count: 0,
                instances: [],
                attributes: new Set()
              });
            }
            
            const component = components.get(tagName);
            component.count++;
            component.instances.push(el);
            
            // Collect attributes
            Array.from(el.attributes).forEach(attr => {
              component.attributes.add(attr.name);
            });
          }
        });
        
        return components;
      }
      
      // Update component list
      function updateComponentList() {
        const content = document.getElementById('wc-devtools-content');
        const components = scanWebComponents();
        
        if (components.size === 0) {
          content.innerHTML = '<div class="wc-no-components">No web components found on this page.</div>';
          return;
        }
        
        const totalInstances = Array.from(components.values()).reduce((sum, c) => sum + c.count, 0);
        
        let html = \`
          <div class="wc-stats">
            <strong>\${components.size}</strong> unique component\${components.size !== 1 ? 's' : ''} • 
            <strong>\${totalInstances}</strong> total instance\${totalInstances !== 1 ? 's' : ''}
          </div>
        \`;
        
        components.forEach((component, tagName) => {
          html += \`
            <div class="wc-component">
              <div class="wc-component-name">&lt;\${tagName}&gt;</div>
              <div class="wc-component-count">\${component.count} instance\${component.count !== 1 ? 's' : ''}</div>
              \${component.attributes.size > 0 ? \`
                <div class="wc-component-attributes">
                  <strong>Attributes:</strong><br>
                  \${Array.from(component.attributes).map(attr => 
                    \`<span class="wc-attribute"><span class="wc-attribute-name">\${attr}</span></span>\`
                  ).join('')}
                </div>
              \` : ''}
            </div>
          \`;
        });
        
        content.innerHTML = html;
      }
      
      // Watch for DOM changes
      const observer = new MutationObserver(() => {
        if (panel.classList.contains('visible')) {
          updateComponentList();
        }
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true
      });
    })();
  `;
}

function getPositionStyles(position: string, isPanel: boolean = false): string {
  const offset = isPanel ? '70px' : '20px';
  
  switch (position) {
    case 'top-left':
      return isPanel 
        ? `top: ${offset}; left: 20px;`
        : `top: 20px; left: 20px;`;
    case 'top-right':
      return isPanel
        ? `top: ${offset}; right: 20px;`
        : `top: 20px; right: 20px;`;
    case 'bottom-left':
      return isPanel
        ? `bottom: ${offset}; left: 20px;`
        : `bottom: 20px; left: 20px;`;
    case 'bottom-right':
    default:
      return isPanel
        ? `bottom: ${offset}; right: 20px;`
        : `bottom: 20px; right: 20px;`;
  }
}

export default webComponentDevTools;
