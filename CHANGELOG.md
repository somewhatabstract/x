# @somewhatabstract/x

## 0.2.0

### Minor Changes

- 6628e67: Forward all arguments to the target script without requiring `--`.

  Previously, running `x the-script positional-arg` would silently drop positional args, and `x the-script --flag value` would fail or drop flags. Now:

  - Positional arguments are forwarded to the script automatically: `x e2e setup verify` works as expected.
  - Unknown flag arguments are also forwarded to the script automatically (via yargs `unknown-options-as-args`).
  - When flag-like args are detected without a `--` separator, a tip is printed recommending the explicit form: `x the-script -- --flag value`.

  The `--` separator is still necessary when a flag name clashes with one of `x`'s own options (e.g. `--dry-run`).

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
