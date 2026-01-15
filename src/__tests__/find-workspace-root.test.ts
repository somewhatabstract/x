import {describe, expect, it, beforeEach, afterEach} from "vitest";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import {findWorkspaceRoot} from "../find-workspace-root";
import {HandledError} from "../errors";

describe("findWorkspaceRoot", () => {
    const testDir = path.join("/tmp", "test-workspace-root");
    const workspaceDir = path.join(testDir, "workspace");
    const nestedDir = path.join(workspaceDir, "nested", "deep");

    beforeEach(async () => {
        // Create test directory structure
        await fs.mkdir(nestedDir, {recursive: true});
        await fs.writeFile(
            path.join(workspaceDir, "pnpm-workspace.yaml"),
            "packages:\n  - 'packages/*'\n",
        );
    });

    afterEach(async () => {
        // Clean up
        await fs.rm(testDir, {recursive: true, force: true});
    });

    it("should find workspace root from nested directory", async () => {
        const result = await findWorkspaceRoot(nestedDir);
        expect(result).toBe(workspaceDir);
    });

    it("should find workspace root from workspace directory itself", async () => {
        const result = await findWorkspaceRoot(workspaceDir);
        expect(result).toBe(workspaceDir);
    });

    it("should throw HandledError when not in a workspace", async () => {
        const nonWorkspaceDir = path.join(testDir, "non-workspace");
        await fs.mkdir(nonWorkspaceDir, {recursive: true});

        await expect(findWorkspaceRoot(nonWorkspaceDir)).rejects.toThrow(
            HandledError,
        );
        await expect(findWorkspaceRoot(nonWorkspaceDir)).rejects.toThrow(
            "Could not find workspace root",
        );
    });
});
