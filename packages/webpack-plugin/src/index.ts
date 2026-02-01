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
  private options: Required<WebComponentDevToolsOptions>;
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
        const clientScriptPath = require.resolve('client/client');
        this.clientScript = readFileSync(clientScriptPath, 'utf-8');
      } catch (error) {
        console.error('[webpack-plugin] Failed to load client script:', error);
        return;
      }
    }

    // Hook into the compilation process
    compiler.hooks.compilation.tap('WebpackWebComponentDevTools', (compilation) => {
      // Check if HtmlWebpackPlugin is available
      const HtmlWebpackPlugin = compiler.options.plugins?.find(
        (plugin) => plugin?.constructor?.name === 'HtmlWebpackPlugin',
      );

      if (!HtmlWebpackPlugin) {
        console.warn(
          '[webpack-plugin] HtmlWebpackPlugin not found. The dev tools will not be injected.',
        );
        return;
      }

      // Use the processAssets hook to modify HTML files
      compilation.hooks.processAssets.tap(
        {
          name: 'WebpackWebComponentDevTools',
          stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_INLINE,
        },
        () => {
          // Find HTML files in assets
          for (const filename in compilation.assets) {
            if (filename.endsWith('.html')) {
              const asset = compilation.assets[filename];
              let html = asset.source().toString();

              // Inject the dev tools script before closing body tag
              const script = `
    <script type="module">
      window.__WC_DEVTOOLS_CONFIG__ = ${JSON.stringify({ position: this.options.position, queryParam: this.options.queryParam })};
      ${this.clientScript}
    </script>
  `;

              html = html.replace('</body>', `${script}</body>`);

              // Update the asset
              compilation.assets[filename] = {
                source: () => html,
                size: () => html.length,
              };
            }
          }
        },
      );
    });
  }
}

export default WebpackWebComponentDevTools;
