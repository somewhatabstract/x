# x

Execute any bin defined by any package within a monorepo without needing to install that package at the root.

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
x <script-name> -- [...args]

# Preview what would be executed (dry-run mode)
x --dry-run <script-name>

# Pass arguments to the script
x my-script -- --noEmit
```

This only executes bin scripts defined by packages in your workspace, not their dependencies. The bin must be an executable file with a shebang (on Unix-like systems) or a directly runnable file (on Windows), or a JS script that can be executed with Node.js.

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
4. **Execution**: Executes the matched script either directly via the OS or via Node.js:
   - **Direct OS execution**: On Unix-like systems this requires an executable file with a shebang; on Windows the bin must be a directly runnable file such as a `.exe`, `.cmd`, or `.bat`.
   - **Node.js execution**: If the bin is a JS file, it is executed with Node.js.

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

## License

MIT
