# Contributing to Web Component Dev Tools

Thank you for your interest in contributing to Web Component Dev Tools! This guide will help you get started with local development and contributing to the project.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Building](#building)
- [Linting and Formatting](#linting-and-formatting)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Code Style Guidelines](#code-style-guidelines)
- [Commit Message Convention](#commit-message-convention)

## Getting Started

Before contributing, please:

1. Check existing [issues](https://github.com/cadamsdev/web-component-dev-tools/issues) to see if your bug/feature is already being discussed
2. For major changes, open an issue first to discuss your ideas
3. Feel free to ask questions in issues or discussions

## Development Setup

This project uses [pnpm](https://pnpm.io) as the package manager.

### Prerequisites

- [pnpm](https://pnpm.io) >= 8.0.0
- [Node.js](https://nodejs.org/) >= 16.0.0
- [Git](https://git-scm.com/)

### Clone and Install

```bash
# Clone the repository
git clone https://github.com/cadamsdev/web-component-dev-tools.git
cd web-component-dev-tools

# Install dependencies
pnpm install
```

## Project Structure

This is a monorepo containing multiple packages:

```
web-component-dev-tools/
├── packages/
│   ├── client/          # Client-side script (build-tool agnostic)
│   │   ├── src/
│   │   └── package.json
│   ├── vite-plugin/     # Vite plugin
│   │   ├── src/
│   │   └── package.json
│   └── webpack-plugin/  # Webpack plugin
│       ├── src/
│       └── package.json
├── apps/
│   ├── vite-example/    # Example React + Vite app
│   └── webpack-example/ # Example React + Webpack app
├── docs/                # Documentation
├── AGENTS.md            # AI agent guidelines
└── package.json         # Root workspace config
```

### Package Architecture

- **Client Package** (`@cadamsdev/wc-devtools-client`) - Contains the UI and functionality for debugging web components. This package is build-tool agnostic.
- **Vite Plugin** (`@cadamsdev/vite-plugin-wc-devtools`) - Vite-specific plugin that injects the client script. Depends on the client package.
- **Webpack Plugin** (`@cadamsdev/webpack-plugin-wc-devtools`) - Webpack-specific plugin that injects the client script. Depends on the client package.

## Development Workflow

### Running Example Apps

The example apps are the best way to test your changes during development:

```bash
# Run Vite example in dev mode
pnpm dev

# Run Webpack example in dev mode
pnpm dev:webpack

# Preview production build
cd apps/vite-example && pnpm preview
cd apps/webpack-example && pnpm preview
```

### Watch Mode

For active development, use watch mode to automatically rebuild on changes:

```bash
# Watch client package
cd packages/client && pnpm dev

# Watch Vite plugin
cd packages/vite-plugin && pnpm dev

# Watch Webpack plugin
cd packages/webpack-plugin && pnpm dev
```

Then run one of the example apps in a separate terminal to see your changes in action.

## Building

```bash
# Build all packages
pnpm build

# Build specific packages
pnpm build:client
pnpm build:plugin
pnpm build:webpack-plugin
```

**Note:** The client package must be built before the plugin packages, but this is handled automatically by workspace dependencies.

### Build Output

- **Client**: Builds to both IIFE (`dist/client.js`) and ESM (`dist/index.mjs`) formats
- **Vite Plugin**: Builds to ESM (`dist/index.mjs`)
- **Webpack Plugin**: Builds to both CJS (`dist/index.cjs`) and ESM (`dist/index.mjs`)

## Linting and Formatting

This project uses [oxlint](https://oxc.rs/) for linting and [oxfmt](https://oxc.rs/) for formatting.

```bash
# Format code
pnpm fmt

# Check formatting (CI)
pnpm fmt:check

# Lint code
pnpm lint

# Lint with auto-fix
pnpm lint:fix
```

**Important:** Always run linting and formatting before committing your changes.

## Testing

**Note:** No testing framework is currently configured. When adding tests in the future, they should cover:

- Client script functionality
- Plugin injection behavior
- Component detection and listing
- Configuration options

For now, manual testing using the example apps is required.

## Submitting Changes

### Pull Request Process

1. **Fork the repository** and create your branch from `main`:
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Make your changes** following the code style guidelines

3. **Test your changes** using the example apps

4. **Run linting and formatting**:
   ```bash
   pnpm fmt
   pnpm lint:fix
   ```

5. **Commit your changes** following the commit convention (see below)

6. **Push to your fork**:
   ```bash
   git push origin feature/amazing-feature
   ```

7. **Open a Pull Request** with:
   - Clear title and description
   - Reference any related issues
   - Screenshots/GIFs if applicable (for UI changes)
   - List of changes and testing performed

### PR Review Process

- Maintainers will review your PR as soon as possible
- Address any requested changes
- Once approved, your PR will be merged

## Code Style Guidelines

Please read [AGENTS.md](../AGENTS.md) for detailed code style guidelines. Key points:

### TypeScript

- Strict mode enabled - no implicit `any`
- Explicit return types for exported functions
- Use `import type` for type-only imports

### Naming Conventions

- **Files**: `kebab-case.ts`
- **Variables/Functions**: `camelCase`
- **Types/Interfaces**: `PascalCase`
- **CSS Classes**: `kebab-case`
- **Custom Elements**: `kebab-case` with hyphen

### Formatting

- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Always use
- **Line Length**: ~100 characters (not strict)

### Lit Web Components

```typescript
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('my-component')
export class MyComponent extends LitElement {
  @property({ type: String })
  label = '';

  @state()
  private _internalState = 0;

  static styles = css`
    :host {
      display: block;
    }
  `;

  render() {
    return html`
      <div class="container">
        ${this.label ? html`<span>${this.label}</span>` : ''}
      </div>
    `;
  }
}
```

## Commit Message Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `style`: Code style changes (formatting, etc.)

### Examples

```bash
# Feature
git commit -m "feat(vite-plugin): add configurable panel position"

# Bug fix
git commit -m "fix(client): resolve shadow DOM detection issue"

# Documentation
git commit -m "docs: update installation instructions"

# Refactor
git commit -m "refactor(client): simplify component detection logic"
```

### Scope (optional but recommended)

- `client` - Changes to the client package
- `vite-plugin` - Changes to the Vite plugin
- `webpack-plugin` - Changes to the Webpack plugin
- `examples` - Changes to example apps
- `docs` - Changes to documentation

## Release Process

This project uses [changesets](https://github.com/changesets/changesets) for version management.

When making changes that should trigger a version bump:

```bash
# Add a changeset
pnpm changeset

# Follow the prompts to describe your changes
```

Maintainers will handle the actual release process.

## Questions?

Feel free to:
- Open an issue with the `question` label
- Start a discussion in GitHub Discussions
- Reach out to maintainers

Thank you for contributing! 🎉
