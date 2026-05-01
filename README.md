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

These examples assume global installation for brevity, but the same commands can be run with a local installation by prefixing with your package manager's exec command as shown above.

```bash
# Execute a bin script from any package in the workspace
x <script-name> [-- <args...>]

# Preview what would be executed (dry-run mode)
x --dry-run <script-name>

# Pass arguments to the script (use `--` when args might look like x's own options)
x my-script -- --flag value
```

This only executes bin scripts defined by packages in your workspace, not bin scripts defined by their dependencies. The bin must be an executable file with a shebang (on Unix-like systems) or a directly runnable file (on Windows), or a JS script that can be executed with Node.js.

> ![NOTE]
> `x` must be installed (globally or locally) to be used. It cannot be used via `npx`, `pnpx`, etc. due to how those tools pass arguments which interferes with how `x` processes arguments. If you want to use `x` without installing it globally, install it as a dev dependency in your monorepo root package and run it via your package manager's exec command as shown above.

## Features

- 🔍 **Automatic Discovery**: Finds all packages in your monorepo workspace via @manypkg
- 👁️ **Dry-Run Mode**: Preview what would be executed with `--dry-run`
- 📦 **Multi-Package-Manager**: Works with npm, Yarn, pnpm, Lerna, Bun, and Rush, mimicking the npm-like environment.
- ⌨️ **Tab completion**: Shell tab completion for available bin scripts

### Tab completion

`@somewhatabstract/x` can generate a shell completion script so you can tab-complete available bin scripts. With `@somewhatabstract/x` installed globally, use this to add tab completion to your current shell session:

```bash
. <(x --completion)
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
