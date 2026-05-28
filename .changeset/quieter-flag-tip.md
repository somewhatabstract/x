---
"@somewhatabstract/x": patch
---

The "use `--` to separate flags" tip is now only shown when an x option flag (e.g. `--dry-run`, `-d`) appears after the script name without a `--` separator — previously it fired for any flag-looking argument, which was noisy because most of those flags pass through to the script just fine. Set `NO_WARN=1` to silence the tip entirely.
