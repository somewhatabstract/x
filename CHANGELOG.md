# @somewhatabstract/x

## 0.1.1

### Patch Changes

- 7b2f95a: Update readme to be more correct and only bundle the dist folder in the published package.

## 0.1.0

### Minor Changes

- 2f64864: Implement monorepo script execution tool with multi-package-manager support

  - Add support for npm, Yarn, pnpm, Lerna, Bun, and Rush workspaces
  - Implement direct script execution without interpreter detection
  - Add dry-run mode for previewing execution
  - Comprehensive test coverage

- 2f64864: Support Node-executable script files (.js, .mjs, .cjs)

  Bin scripts with `.js`, `.mjs`, or `.cjs` extensions are now automatically
  invoked via the Node executable, matching npm/pnpm behavior. Previously, only
  files with a shebang and executable permissions were supported.

### Patch Changes

- 2f64864: Add test coverage for all source files including the CLI entry point
- 2f64864: Add Biome for linting and code formatting.
