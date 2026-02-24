---
"@somewhatabstract/x": minor
---

Pass unknown flag arguments to the target script and warn when `--` is missing.

Previously, running `x the-script --flag value` would either fail with a yargs "unknown argument" error or silently drop the flags. Now:

- Unknown flag arguments are forwarded to the script automatically (via yargs `unknown-options-as-args`).
- When flag-like args are detected without a `--` separator, a tip is printed recommending the explicit form: `x the-script -- --flag value`.

The `--` separator is still necessary when a flag name clashes with one of `x`'s own options (e.g. `--dry-run`).
