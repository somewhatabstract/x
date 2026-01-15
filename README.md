# x

Execute any bin defined by any package in a monorepo without needing to install that package.

## Overview

`x` is a tool for pnpm workspaces that allows you to execute binary scripts from any package in your monorepo without installing them globally or in your current package. It automatically discovers all packages in your workspace and finds the matching bin script.

## Installation

```bash
npm install -g @somewhatabstract/x
# or
pnpm add -g @somewhatabstract/x
```

## Usage

```bash
# Execute a bin script from any package in the workspace
pnpm x <script-name> [...args]

# Preview what would be executed (dry-run mode)
pnpm x --dry-run <script-name>

# Pass arguments to the script
pnpm x tsc --noEmit
pnpm x eslint src/ --fix
pnpm x jest --watch
```

### Examples

```bash
# Run TypeScript compiler from any package that provides it
pnpm x tsc --noEmit

# Run ESLint from any package in the workspace
pnpm x eslint src/

# Preview which jest binary would be executed
pnpm x --dry-run jest

# Run a custom script with arguments
pnpm x my-custom-script arg1 arg2
```

## Features

- 🔍 **Automatic Discovery**: Finds all packages in your pnpm workspace
- 🎯 **Smart Matching**: Locates the bin script you want to run
- 🚀 **No Installation Needed**: Execute bins without installing packages
- 👁️ **Dry-Run Mode**: Preview what would be executed with `--dry-run`
- 🔧 **Multi-Language Support**: Works with Node.js, Bash, Python, and other interpreters via shebang detection
- ⚡ **Fast**: Efficient package discovery using `pnpm list`
- 🛡️ **Type-Safe**: Written in TypeScript with full type safety

## How It Works

1. **Workspace Detection**: Uses `ancesdir` to find the workspace root by looking for `pnpm-workspace.yaml`
2. **Package Discovery**: Runs `pnpm list --json --recursive` to discover all packages in the workspace
3. **Bin Matching**: Searches through package.json files to find bins matching your requested script name
4. **Execution**: Spawns the matched script with proper environment and interpreter (via shebang detection)

## Requirements

- Node.js >= 20
- pnpm workspace (must have a `pnpm-workspace.yaml` file)

## CLI Options

- `<script-name>` - Name of the bin script to execute (required)
- `[args...]` - Arguments to pass to the script (optional)
- `-d, --dry-run` - Show what would be executed without running it
- `-h, --help` - Show help
- `-v, --version` - Show version

## Error Handling

The tool provides clear, user-friendly error messages:

- **Not in a workspace**: "Could not find workspace root. Make sure you're in a pnpm workspace (pnpm-workspace.yaml not found)."
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
- `find-workspace-root.ts` - Workspace root detection using ancesdir
- `discover-packages.ts` - Package discovery via pnpm list
- `find-matching-bins.ts` - Bin script matching logic
- `execute-script.ts` - Script execution with shebang detection
- `x-impl.ts` - Main orchestration logic
- `bin/x.ts` - CLI entry point with yargs

## License

MIT

