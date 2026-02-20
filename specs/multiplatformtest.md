# MULTIPLATFORMTEST: Expand GitHub Actions to Multi-Platform Testing

## Overview

Expand the GitHub Actions workflow to run tests on Ubuntu, macOS, and Windows to validate platform-specific behavior and ensure cross-platform compatibility. This is particularly important now that the tool supports both shebangs (Unix-only) and node-executable files (cross-platform).

## Rationale

With the addition of platform-dependent features (shebangs don't work on Windows), it's important to validate that:

- Node-executable files (`.js`, `.mjs`, `.cjs`) work correctly on all platforms
- Shebang execution works on Unix platforms and fails gracefully on Windows
- Environment variables are set correctly across platforms
- Signal handling works appropriately on each platform
- File path handling respects platform conventions

Single-platform (Ubuntu) testing doesn't catch these issues.

## Implementation Steps

### 1. Locate the test workflow

Find the GitHub Actions workflow file in `.github/workflows/` that contains the current test job (currently runs on Ubuntu only).

### 2. Add matrix strategy

Update the test job configuration to use a matrix strategy specifying:

- `ubuntu-latest` (primary platform, closest to production environments)
- `macos-latest` (Unix variant, tests BSD-style shebangs)
- Optional: `windows-latest` (nice-to-have; validates graceful degradation)

### 3. Run tests across all platforms

The existing `pnpm test` command will run on each platform in the matrix.

### 4. Verify results

Ensure all tests pass on each platform. Document any platform-specific test skips if necessary (though none should be needed for the current test suite).

## Expected Outcomes

All test suites should pass on:

- ✅ Ubuntu (baseline, existing behavior)
- ✅ macOS (validates Unix/BSD shebang support)
- ⚠️ Windows (validates node-executable files work, shebangs fail gracefully)

## Verification

- Workflow runs successfully on all specified platforms
- All tests pass on each platform
- Coverage metrics are consistent across platforms

## Key Decisions

- **Primary platforms:** Ubuntu and macOS (required)
- **Secondary platform:** Windows (nice-to-have)
- **Scope:** Only expand existing test job (no new tests needed)
- **Timing:** Implement after NODEEXEC feature is complete and working on single platform

## Files Modified

- `.github/workflows/<test-workflow-name>` (add matrix strategy)

## Future Enhancements

Once multi-platform testing is established, consider:

- Platform-specific test skips if any features are platform-limited
- Environment variable validation per platform
- Platform-specific shebang testing (ensure Unix shebangs work on macOS/Ubuntu, fail gracefully on Windows)
