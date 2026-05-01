# @somewhatabstract/x

[![Node CI](https://github.com/somewhatabstract/x/workflows/Node%20CI/badge.svg)](https://github.com/somewhatabstract/x/actions) [![codecov](https://codecov.io/gh/somewhatabstract/x/branch/main/graph/badge.svg)](https://codecov.io/gh/somewhatabstract/x) [![npm (tag)](https://img.shields.io/npm/v/@somewhatabstract/x/latest)](https://www.npmjs.com/package/@somewhatabstract/x) [![Node Version Required](https://img.shields.io/node/v/@somewhatabstract/x/latest)](https://img.shields.io/node/v/@somewhatabstractx/latest)

![Project wordmark](./assets/wordmark.png)

Execute bin scripts from monorepo packages without installing them at the root.

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

### Global installation

```bash
npm install -g @somewhatabstract/x
# or
pnpm add -g @somewhatabstract/x
# or
yarn global add @somewhatabstract/x
```

When run from the global installation, `x` is invoked as just `x`. It will mimic the environment for the target script that it would run under if it had been invoked via `npm exec` or equivalent.

### Local installation

```bash
npm install -D @somewhatabstract/x
# or
pnpm add -D @somewhatabstract/x
# or
yarn add -D @somewhatabstract/x
```

When run from a local installation, `x` will execute the local version of `x` and use the package manager that was used to install it. To run the local version of `x`, use your package manager's exec command:

```bash
npm exec x <script-name> [-- <args...>]
# or
pnpm x <script-name> [-- <args...>]
# or
yarn x <script-name> [-- <args...>]
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
- 📦 **Multi-Package-Manager**: Works with npm, Yarn, pnpm, Lerna, Bun, and Rush, mimicking the npm-like environment.
- ⌨️ **Auto-completion**: Shell autocompletion for available bin scripts

### Auto-completion

`@somewhatabstract/x` can generate a shell completion script so you can tab-complete available bin scripts. It is recommended to use a global installation of `x` for tab completion support since it will register the specific path to the `x` binary invoked to add the support (which could be the one installed in a specific project when not using a global installation).

With `@somewhatabstract/x` installed globally, add this to your shell configuration file (e.g. `~/.bashrc`, `~/.zshrc`, etc.):

```bash
source <(x --completion)
```

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
