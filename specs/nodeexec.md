# NODEEXEC: Support Node-Executable Script Files

## Overview

Expand the tool to invoke `.js`, `.mjs`, and `.cjs` files via the Node executable, matching npm's behavior while preserving OS-level execution for other file types. This allows users to run JavaScript bin scripts without requiring the executable bit, making the tool more compatible with standard npm/pnpm package conventions.

## Rationale

Currently, the tool only supports bin files with shebangs or native executables. This means JavaScript bin files require either:

- An explicit shebang (`#!/usr/bin/env node`) and executable permissions
- Or the file to be pre-compiled/transpiled

By detecting node-executable file extensions (`.js`, `.mjs`, `.cjs`), we can invoke these files via the Node executable automatically, matching npm's behavior and supporting a much wider range of JavaScript bin scripts without requiring shebangs or special permissions.

## Implementation Steps

### 1. Update `execute-script.ts` with extension detection

Add a helper function to determine the correct execution strategy:

- Check if `binPath.toLowerCase()` ends with `.js`, `.mjs`, or `.cjs` (case-insensitive)
- If yes, invoke via `process.execPath` (Node executable) with the bin path as the first argument
- If no, invoke the bin path directly (current behavior)
- Preserve the original case of `binPath` in spawn call (security: don't normalize paths on case-sensitive filesystems)

Location: `src/execute-script.ts`

### 2. Modify spawn() call in `execute-script.ts`

Update the spawn call to use the resolved executable path and arguments from the helper function created in step 1.

### 3. Add comprehensive test coverage to `execute-script.test.ts`

Add tests covering:

**Node-executable extensions:**

- `.js` file invoked via node with correct args passed through
- `.mjs` file invoked via node with correct args passed through
- `.cjs` file invoked via node with correct args passed through

**Case variations:**

- `.JS` file invoked via node (case-insensitive detection)
- `.Js` file invoked via node
- `.MJS` file invoked via node
- `.CJS` file invoked via node
- `.Mjs` file invoked via node

**Non-node paths:**

- Executable bash script invoked directly (not via node)
- Non-executable bash script invoked directly (will error)
- File with no extension invoked directly
- File with extension in the middle (e.g., `script.js.bak`) invoked directly

**Behavior preservation:**

- Executable bit ignored for `.js` files (extension takes precedence over permission state)
- Environment variables correctly passed to node-invoked scripts
- stdio inheritance works for node-invoked scripts
- Exit codes passed through from node-invoked scripts
- Spawn errors (ENOENT, EACCES) handled for both execution paths
- Signal handling (SIGTERM, SIGINT) for node-invoked scripts
- Arguments with spaces and special characters preserved for node-invoked scripts
- Multiple arguments passed correctly to node-invoked scripts

### 4. Update test setup

Mock files with appropriate extensions and executable states to support the new test cases.

## Verification

- Run `pnpm test` to ensure all tests pass (existing + new)
- Manual spot-check on macOS and Windows if possible
- Ensure coverage report includes new code paths

## Key Decisions

- **Extension matching:** Case-insensitive (supports `.js`, `.JS`, `.Js`, etc.), but preserves original path casing in spawn call
- **Scope:** JS/MJS/CJS only—matches npm convention
- **Executable bit:** Ignored for node-executable extensions (extension determines interpreter choice)
- **Cross-platform:** Automatic for JS files; shebangs continue to work on Unix and fail gracefully on Windows (matching npm/pnpm behavior)
- **Fallback:** Non-node files continue to be executed directly by the OS

## Files Modified

- `src/execute-script.ts` (main implementation)
- `src/__tests__/execute-script.test.ts` (test coverage)

## Files Not Modified

- `src/resolve-bin-path.ts` (path resolution unchanged)
- `src/find-matching-bins.ts` (bin discovery unchanged)
- `src/x-impl.ts` (orchestration unchanged)
