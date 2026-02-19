# Linting and Formatting via Biome

Date: 2026-02-19

## Goal

Introduce linting and formatting enforced by CI, using Biome, and align rules with the `somewhatabstract/ancesdir` and `somewhatabstract/checksync` repos.

## Decisions

- Use Biome for both linting and formatting.
- Enforce lint + format checks in CI via `pnpm lint`.
- Keep a single `lint` script for validation
- Add `format` script for auto-formatting that uses `pnpm lint --write --unsafe` to apply fixes.
- Mirror existing rules from related repos as closely as practical.

## Plan

1. [ ] Add Biome tooling
   1.1. [ ] Add `@biomejs/biome` as a dev dependency in `/Users/jeffyates/git/x/package.json`.
   1.2. [ ] Replace the current no-op `lint` script with `biome check .` in `/Users/jeffyates/git/x/package.json`.

2. [ ] Create Biome configuration
   2.1. [ ] Add `/Users/jeffyates/git/x/biome.json` mirroring lint/format rules from `somewhatabstract/ancesdir` and `somewhatabstract/checksync`.
   2.2. [ ] Ensure Biome ignores generated artifacts such as `/Users/jeffyates/git/x/coverage` and any build outputs.

3. [ ] Documentation alignment
   3.1. [ ] Confirm `/Users/jeffyates/git/x/CONTRIBUTING.md` remains accurate about Biome usage; update only if wording diverges.
   3.2. [ ] Optionally update `/Users/jeffyates/git/x/README.md` if it mentions linting commands.

## Verification

- Run `pnpm lint` and confirm it fails on lint/format violations and passes on a clean state.
- Run `pnpm format` to fix lint errors and confirm that it applies changes correctly.
