# x

Execute any bin defined by any package in a monorepo without needing to install that package.

## Overview

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
x <script-name> [...args]

# Preview what would be executed (dry-run mode)
x --dry-run <script-name>

# Pass arguments to the script
x tsc --noEmit
x eslint src/ --fix
x jest --watch
```

### Examples

```bash
# Run TypeScript compiler from any package that provides it
x tsc --noEmit

# Run ESLint from any package in the workspace
x eslint src/

# Preview which jest binary would be executed
x --dry-run jest

# Run a custom script with arguments
x my-custom-script arg1 arg2
```

## Features

- 🔍 **Automatic Discovery**: Finds all packages in your monorepo workspace
- 🎯 **Smart Matching**: Locates the bin script you want to run
- 🚀 **No Installation Needed**: Execute bins without installing packages
- 👁️ **Dry-Run Mode**: Preview what would be executed with `--dry-run`
- 🔧 **Multi-Language Support**: Works with any executable script (Node.js, Bash, Python, etc.)
- 📦 **Multi-Package-Manager**: Works with npm, Yarn, pnpm, Lerna, Bun, and Rush
- ⚡ **Fast**: Efficient package discovery using @manypkg
- 🛡️ **Type-Safe**: Written in TypeScript with full type safety

## How It Works

1. **Workspace Detection**: Uses `@manypkg/find-root` to find the workspace root (supports npm, Yarn, pnpm, Lerna, Bun, Rush)
2. **Package Discovery**: Uses `@manypkg/get-packages` to discover all packages in the workspace
3. **Bin Matching**: Searches through package.json files to find bins matching your requested script name
4. **Execution**: Executes the matched script directly (assumes executable with proper shebang)

## Requirements

- Node.js >= 20
- A monorepo workspace (npm, Yarn, pnpm, Lerna, Bun, or Rush)

## CLI Options

- `<script-name>` - Name of the bin script to execute (required)
- `[args...]` - Arguments to pass to the script (optional)
- `-d, --dry-run` - Show what would be executed without running it
- `-h, --help` - Show help
- `-v, --version` - Show version

## Error Handling

The tool provides clear, user-friendly error messages:

- **Not in a workspace**: "Could not find workspace root. Make sure you're in a monorepo workspace."
- **Script not found**: "No bin script named '<name>' found in any workspace package."
- **Ambiguous match**: Lists all packages that provide the bin and asks you to be more specific

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

## Architecture

The implementation follows a modular design with separate concerns:

- `errors.ts` - Custom error types for user-friendly messages
- `find-workspace-root.ts` - Workspace root detection using @manypkg/find-root
- `discover-packages.ts` - Package discovery via @manypkg/get-packages
- `find-matching-bins.ts` - Bin script matching logic
- `execute-script.ts` - Direct script execution
- `x-impl.ts` - Main orchestration logic
- `bin/x.ts` - CLI entry point with yargs

## License

MIT

