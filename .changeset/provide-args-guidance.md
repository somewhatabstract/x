---
"@somewhatabstract/x": minor
---

Forward all arguments to the target script without requiring `--`.

Previously, running `x the-script positional-arg` would silently drop positional args, and `x the-script --flag value` would fail or drop flags. Now:

- Positional arguments are forwarded to the script automatically: `x e2e setup verify` works as expected.
- Unknown flag arguments are also forwarded to the script automatically (via yargs `unknown-options-as-args`).
- When flag-like args are detected without a `--` separator, a tip is printed recommending the explicit form: `x the-script -- --flag value`.

The `--` separator is still necessary when a flag name clashes with one of `x`'s own options (e.g. `--dry-run`).
