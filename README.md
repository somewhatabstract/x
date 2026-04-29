<picture title="Project wordmark">
   <source media="(prefers-color-scheme: dark)" srcset="./assets/wordmark-dark.png" />
   <img alt="Project wordmark" src="./assets/wordmark-light.png"/>
</picture>

Easily execute bin scripts from monorepo packages without installing them at the root.

# <picture title="X logo"><source media="(prefers-reduced-motion: reduce) and (prefers-color-scheme: dark)" srcset="./assets/logo-dark.png" /><source media="(prefers-reduced-motion: reduce)" srcset="./assets/logo-light.png" /><source media="(prefers-color-scheme: dark)" srcset="./assets/x-logo-dark.gif" /><img style="width: 32px; height: 32px;" alt="X tool logo" src="assets/x-logo-light.gif"/></picture>

`x` is a tool for monorepos that allows you to execute binary scripts from any package in your workspace without installing them globally or in your current package. It automatically discovers all packages in your workspace and finds the matching bin script.

**Supports multiple package managers:**

- 📦 npm workspaces
- 🧶 Yarn (classic and modern)
- 📌 pnpm workspaces
- 🎯 Lerna
- 🍞 Bun workspaces
- 🚀 Rush

## Installation

```bash
npm install -g @somewhatabstract/x
# or
pnpm add -g @somewhatabstract/x
# or
yarn global add @somewhatabstract/x
```

## Usage

```bash
# Execute a bin script from any package in the workspace
pnpm x <script-name> [-- <args...>]

# Preview what would be executed (dry-run mode)
pnpm x --dry-run <script-name>

# Pass arguments to the script (use `--` when args might look like x's own options)
pnpm x my-script -- --flag value
```

This only executes bin scripts defined by packages in your workspace, not their dependencies. The bin must be an executable file with a shebang (on Unix-like systems) or a directly runnable file (on Windows), or a JS script that can be executed with Node.js.

## Features

- 🔍 **Automatic Discovery**: Finds all packages in your monorepo workspace
- 🚀 **No Installation Needed**: Execute bins from the root without needing to install your workspace packages in the root package
- 👁️ **Dry-Run Mode**: Preview what would be executed with `--dry-run`
- 🔧 **Multi-Language Support**: Works with any executable script (Node.js, Bash, Python, etc.)
- 📦 **Multi-Package-Manager**: Works with npm, Yarn, pnpm, Lerna, Bun, and Rush
- ⚡ **Fast**: Efficient package discovery using @manypkg

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Type check
pnpm typecheck

# Build
pnpm build

# Run locally
./dist/x.mjs <script-name>
```

## License

MIT
