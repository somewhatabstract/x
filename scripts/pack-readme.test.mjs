/**
 * Guard against the pack-readme.mjs script leaving the README in a broken
 * state (e.g. if the process was killed between prepack and postpack).
 *
 * Run as part of `pnpm test` so CI catches this automatically.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(import.meta.dirname, "..");

describe("pack-readme", () => {
    it("should not leave a README backup file behind", () => {
        // Arrange
        const backupPath = join(root, "README.md.bak");

        // Act
        const backupExists = existsSync(backupPath);

        // Assert
        expect(
            backupExists,
            "README.md.bak exists — the publish process may have been " +
                "interrupted. Run: node scripts/pack-readme.mjs restore",
        ).toBe(false);
    });

    it("should not leave README.md with rewritten GitHub raw URLs", () => {
        // Arrange
        const readmePath = join(root, "README.md");

        // Act
        const readme = readFileSync(readmePath, "utf8");

        // Assert
        expect(
            readme.includes("raw.githubusercontent.com"),
            "README.md contains raw.githubusercontent.com URLs — the publish " +
                "process may have been interrupted. Run: node scripts/pack-readme.mjs restore",
        ).toBe(false);
    });
});
