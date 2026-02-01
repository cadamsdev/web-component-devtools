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
  /**
   * Query parameter name to check for enabling dev tools
   * If specified, the dev tools button will only show when this query param is present
   * Example: queryParam: 'debug' will show dev tools when ?debug is in the URL
   */
  queryParam?: string;
  /**
   * Include the dev tools in production builds (default: false)
   * By default, dev tools are only included in development mode
   */
  includeInProduction?: boolean;
}

export function webComponentDevTools(options: WebComponentDevToolsOptions = {}): Plugin {
  const {
    enabled = true,
    position = 'bottom-right',
    queryParam,
    includeInProduction = false,
  } = options;

  let isDev = false;
  let clientScript: string | null = null;

  return {
    name: 'vite-plugin',

    configResolved(config) {
      isDev = config.mode === 'development';

      // Load the client script when enabled (either in dev mode or production if includeInProduction is true)
      if (enabled && (isDev || includeInProduction)) {
        try {
          // Resolve the client package and read the client.js file
          const clientPackagePath = require.resolve('@cadamsdev/wc-devtools-client/client');
          clientScript = readFileSync(clientPackagePath, 'utf-8');
        } catch (error) {
          console.error('[vite-plugin] Failed to load client script:', error);
        }
      }
    },

    transformIndexHtml(html) {
      // Skip if dev tools are disabled, or if in production and not explicitly enabled for production
      if (!enabled || (!isDev && !includeInProduction) || !clientScript) {
        return html;
      }

      // Inject the dev tools script with configuration
      const script = `
        window.__WC_DEVTOOLS_CONFIG__ = ${JSON.stringify({ position, queryParam })};
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
