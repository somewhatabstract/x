![Project wordmark](./assets/wordmark.png)

Execute bin scripts from monorepo packages without installing them at the root.

# <picture title="X logo"><source media="(prefers-reduced-motion: reduce) and (prefers-color-scheme: dark)" srcset="./assets/logo-dark.png" /><source media="(prefers-reduced-motion: reduce)" srcset="./assets/logo-light.png" /><source media="(prefers-color-scheme: dark)" srcset="./assets/x-logo-dark.gif" /><img style="width: 32px; height: 32px;" alt="X tool logo" src="assets/x-logo-light.gif"/></picture>

`x` is a tool for monorepos that allows you to execute binary scripts from any package in your workspace without installing them globally or in your current package. It automatically discovers all packages in your workspace and finds the matching bin script.

**Supports multiple package managers:**

- npm workspaces
- Yarn (classic and modern)
- pnpm workspaces
- Lerna
- Bun workspaces
- Rush

## Installation

Install `@somewhatabstract/x` globally, or as a dev dependency in your monorepo root package (you only need to install it once at the root of your workspace, not in each package).

```bash
npm install -g @somewhatabstract/x
# or
pnpm add -g @somewhatabstract/x
# or
yarn global add @somewhatabstract/x
```

## Usage

These examples omit the package manager execution prefix for brevity — in practice you'd run e.g. `pnpm x <script-name>`.

```bash
# Execute a bin script from any package in the workspace
x <script-name> [-- <args...>]

# Preview what would be executed (dry-run mode)
x --dry-run <script-name>

# Pass arguments to the script (use `--` when args might look like x's own options)
x my-script -- --flag value
```

This only executes bin scripts defined by packages in your workspace, not their dependencies. The bin must be an executable file with a shebang (on Unix-like systems) or a directly runnable file (on Windows), or a JS script that can be executed with Node.js.

## Features

- 🔍 **Automatic Discovery**: Finds all packages in your monorepo workspace via @manypkg
- 👁️ **Dry-Run Mode**: Preview what would be executed with `--dry-run`
- 📦 **Multi-Package-Manager**: Works with npm, Yarn, pnpm, Lerna, Bun, and Rush
- ⌨️ **Auto-completion**: Shell autocompletion for available bin scripts

### Auto-completion

`x` can generate a shell completion script so you can tab-complete available bin scripts.

If you have `x` installed globally, add this to your shell configuration file (e.g. `~/.bashrc`, `~/.zshrc`, etc.):

```bash
source <(x --completion)
```

Or, if you prefer to use `x` without installing it globally, you can add this to your shell configuration file:

```bash
source <(npx @somewhatabstract/x --completion)
```

You can also write the completion script to a file and source it from there:

```bash
x --completion > ~/.x-completion.sh
source ~/.x-completion.sh
```

If `x` is installed per-workspace rather than globally, source the completion script from the local installation instead.

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Lint
pnpm lint

# Type check
pnpm typecheck

# Build
pnpm build

# Run locally
./dist/x.mjs <script-name>
```

## License

MIT
