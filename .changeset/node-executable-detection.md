---
"@somewhatabstract/x": minor
---

Support Node-executable script files (.js, .mjs, .cjs)

Bin scripts with `.js`, `.mjs`, or `.cjs` extensions are now automatically
invoked via the Node executable, matching npm/pnpm behavior. Previously, only
files with a shebang and executable permissions were supported.
