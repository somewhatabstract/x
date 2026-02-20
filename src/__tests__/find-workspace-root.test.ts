import * as fs from "node:fs/promises";
import * as path from "node:path";
import {afterEach, beforeEach, describe, expect, it} from "vitest";
import {HandledError} from "../errors";
import {findWorkspaceRoot} from "../find-workspace-root";

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
        // Arrange
        const searchDir = nestedDir;

        // Act
        const result = await findWorkspaceRoot(searchDir);

        // Assert
        expect(result).toBe(workspaceDir);
    });

    it("should find workspace root from workspace directory itself", async () => {
        // Arrange
        const searchDir = workspaceDir;

        // Act
        const result = await findWorkspaceRoot(searchDir);

        // Assert
        expect(result).toBe(workspaceDir);
    });

    it("should throw HandledError when not in a workspace", async () => {
        // Arrange
        const nonWorkspaceDir = path.join(testDir, "non-workspace");
        await fs.mkdir(nonWorkspaceDir, {recursive: true});

        // Act
        const underTest = () => findWorkspaceRoot(nonWorkspaceDir);

        // Assert
        await expect(underTest).rejects.toThrow(HandledError);
    });

    it("should provide meaningful error message when not in a workspace", async () => {
        // Arrange
        const nonWorkspaceDir = path.join(testDir, "non-workspace");
        await fs.mkdir(nonWorkspaceDir, {recursive: true});

        // Act
        const underTest = () => findWorkspaceRoot(nonWorkspaceDir);

        // Assert
        await expect(underTest).rejects.toThrow(
            "Could not find workspace root",
        );
    });
});
