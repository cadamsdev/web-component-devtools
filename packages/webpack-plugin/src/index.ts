import type { Compiler } from 'webpack';
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

export class WebpackWebComponentDevTools {
  private options: {
    enabled: boolean;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    queryParam?: string;
    includeInProduction: boolean;
  };
  private clientScript: string | null = null;

  constructor(options: WebComponentDevToolsOptions = {}) {
    this.options = {
      enabled: options.enabled ?? true,
      position: options.position ?? 'bottom-right',
      queryParam: options.queryParam,
      includeInProduction: options.includeInProduction ?? false,
    };
  }

  apply(compiler: Compiler) {
    const isDev = compiler.options.mode === 'development';

    // Skip if dev tools are disabled, or if in production and not explicitly enabled for production
    if (!this.options.enabled || (!isDev && !this.options.includeInProduction)) {
      return;
    }

    // Load the client script once
    if (!this.clientScript) {
      try {
        const clientScriptPath = require.resolve('@cadamsdev/wc-devtools-client/client');
        this.clientScript = readFileSync(clientScriptPath, 'utf-8');
      } catch (error) {
        console.error('[webpack-plugin] Failed to load client script:', error);
        return;
      }
    }

    // Hook into the compilation process
    compiler.hooks.compilation.tap('WebpackWebComponentDevTools', (compilation) => {
      // Get HtmlWebpackPlugin hooks
      const hooks = (compilation.hooks as any).htmlWebpackPluginAfterHtmlProcessing;

      if (!hooks) {
        // Try alternative hook for newer versions of HtmlWebpackPlugin
        const HtmlWebpackPlugin = compiler.options.plugins?.find(
          (plugin) => plugin?.constructor?.name === 'HtmlWebpackPlugin',
        ) as any;

        if (!HtmlWebpackPlugin) {
          console.warn(
            '[webpack-plugin] HtmlWebpackPlugin not found. The dev tools will not be injected.',
          );
          return;
        }

        // Use the newer HtmlWebpackPlugin v4+ hook
        const htmlPluginHooks = HtmlWebpackPlugin.constructor.getHooks(compilation);

        if (htmlPluginHooks && htmlPluginHooks.beforeEmit) {
          htmlPluginHooks.beforeEmit.tapAsync(
            'WebpackWebComponentDevTools',
            (data: any, cb: any) => {
              // Inject the dev tools script before closing body tag
              const script = `
    <script type="module">
      window.__WC_DEVTOOLS_CONFIG__ = ${JSON.stringify({ position: this.options.position, queryParam: this.options.queryParam })};
      ${this.clientScript}
    </script>
  `;

              data.html = data.html.replace('</body>', `${script}</body>`);
              cb(null, data);
            },
          );
        }
      }
    });
  }
}

export default WebpackWebComponentDevTools;
