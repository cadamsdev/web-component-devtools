# Example: Creating a Webpack Plugin

Here's an example of how you could create a Webpack plugin using the `web-component-dev-tools-client` package:

```typescript
// webpack-web-component-dev-tools.ts
import { Compiler } from 'webpack';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const require = createRequire(import.meta.url);

interface WebComponentDevToolsOptions {
  enabled?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export class WebpackWebComponentDevTools {
  private options: Required<WebComponentDevToolsOptions>;

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

    // Load the client script
    const clientScriptPath = require.resolve('web-component-dev-tools-client/client');
    const clientScript = readFileSync(clientScriptPath, 'utf-8');

    compiler.hooks.compilation.tap('WebpackWebComponentDevTools', (compilation) => {
      HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(
        'WebpackWebComponentDevTools',
        (data, cb) => {
          // Inject the dev tools script before closing body tag
          const script = `
            <script type="module">
              window.__WC_DEVTOOLS_CONFIG__ = ${JSON.stringify({ position: this.options.position })};
              ${clientScript}
            </script>
          `;
          
          data.html = data.html.replace('</body>', `${script}</body>`);
          cb(null, data);
        }
      );
    });
  }
}

// Usage in webpack.config.js:
// import { WebpackWebComponentDevTools } from './webpack-web-component-dev-tools';
//
// export default {
//   plugins: [
//     new HtmlWebpackPlugin(),
//     new WebpackWebComponentDevTools({
//       position: 'bottom-right'
//     })
//   ]
// };
```

## Key Points

1. **Import the client script**: Use `require.resolve()` to find the client script path
2. **Read the script content**: Use `fs.readFileSync()` to load the script
3. **Inject the configuration**: Set `window.__WC_DEVTOOLS_CONFIG__` before the client script
4. **Only enable in development**: Check the build mode before injecting

This same pattern can be used for any build tool (Rollup, ESbuild, Parcel, etc.).
