import type { Plugin } from 'vite';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

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
  let clientScript: string | null = null;

  return {
    name: 'vite-web-component-dev-tools',

    configResolved(config) {
      isDev = config.mode === 'development';

      // Load the client script once when config is resolved
      if (isDev && enabled) {
        try {
          // Resolve the client package and read the client.js file
          const clientPackagePath = require.resolve('web-component-dev-tools-client/client');
          clientScript = readFileSync(clientPackagePath, 'utf-8');
        } catch (error) {
          console.error('[vite-web-component-dev-tools] Failed to load client script:', error);
        }
      }
    },

    transformIndexHtml(html) {
      // Only inject in development mode if enabled
      if (!isDev || !enabled || !clientScript) {
        return html;
      }

      // Inject the dev tools script with configuration
      const script = `
        window.__WC_DEVTOOLS_CONFIG__ = ${JSON.stringify({ position })};
        ${clientScript}
      `;

      return {
        html,
        tags: [
          {
            tag: 'script',
            attrs: {
              type: 'module',
            },
            children: script,
            injectTo: 'body',
          },
        ],
      };
    },
  };
}

export default webComponentDevTools;
