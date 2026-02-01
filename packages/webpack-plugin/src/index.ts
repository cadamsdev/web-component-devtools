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
}

export class WebpackWebComponentDevTools {
  private options: Required<WebComponentDevToolsOptions>;
  private clientScript: string | null = null;

  constructor(options: WebComponentDevToolsOptions = {}) {
    this.options = {
      enabled: options.enabled ?? true,
      position: options.position ?? 'bottom-right',
    };
  }

  apply(compiler: Compiler) {
    const isDev = compiler.options.mode === 'development';

    if (!isDev || !this.options.enabled) {
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
        (plugin) => plugin?.constructor?.name === 'HtmlWebpackPlugin'
      );

      if (!HtmlWebpackPlugin) {
        console.warn(
          '[webpack-plugin] HtmlWebpackPlugin not found. The dev tools will not be injected.'
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
      window.__WC_DEVTOOLS_CONFIG__ = ${JSON.stringify({ position: this.options.position })};
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
        }
      );
    });
  }
}

export default WebpackWebComponentDevTools;
