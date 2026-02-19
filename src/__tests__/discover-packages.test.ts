import {describe, expect, it, vi, beforeEach} from "vitest";
import {discoverPackages} from "../discover-packages";
import {HandledError} from "../errors";
import * as manypkg from "@manypkg/get-packages";

// Mock @manypkg/get-packages
vi.mock("@manypkg/get-packages", () => ({
    getPackages: vi.fn(),
}));

describe("discoverPackages", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should return packages from @manypkg", async () => {
        // Arrange
        const workspaceRoot = "/test/workspace";
        const mockPackages = {
            packages: [
                {
                    packageJson: {name: "pkg1", version: "1.0.0"},
                    dir: "/test/workspace/pkg1",
                },
                {
                    packageJson: {name: "pkg2", version: "2.0.0"},
                    dir: "/test/workspace/pkg2",
                },
            ],
        };

        vi.mocked(manypkg.getPackages).mockResolvedValue(mockPackages as any);

        // Act
        const result = await discoverPackages(workspaceRoot);

        // Assert
        expect(result).toHaveLength(2);
    });

    it("should map package names correctly", async () => {
        // Arrange
        const workspaceRoot = "/test/workspace";
        const mockPackages = {
            packages: [
                {
                    packageJson: {name: "test-package", version: "1.0.0"},
                    dir: "/test/workspace/pkg",
                },
            ],
        };

        vi.mocked(manypkg.getPackages).mockResolvedValue(mockPackages as any);

        // Act
        const result = await discoverPackages(workspaceRoot);

        // Assert
        expect(result[0].name).toBe("test-package");
    });

    it("should map package paths correctly", async () => {
        // Arrange
        const workspaceRoot = "/test/workspace";
        const mockPackages = {
            packages: [
                {
                    packageJson: {name: "test-package", version: "1.0.0"},
                    dir: "/test/workspace/packages/test",
                },
            ],
        };

        vi.mocked(manypkg.getPackages).mockResolvedValue(mockPackages as any);

        // Act
        const result = await discoverPackages(workspaceRoot);

        // Assert
        expect(result[0].path).toBe("/test/workspace/packages/test");
    });

    it("should map package versions correctly", async () => {
        // Arrange
        const workspaceRoot = "/test/workspace";
        const mockPackages = {
            packages: [
                {
                    packageJson: {name: "test-package", version: "3.2.1"},
                    dir: "/test/workspace/pkg",
                },
            ],
        };

        vi.mocked(manypkg.getPackages).mockResolvedValue(mockPackages as any);

        // Act
        const result = await discoverPackages(workspaceRoot);

        // Assert
        expect(result[0].version).toBe("3.2.1");
    });

    it("should use 'unknown' for missing version", async () => {
        // Arrange
        const workspaceRoot = "/test/workspace";
        const mockPackages = {
            packages: [
                {
                    packageJson: {name: "test-package"},
                    dir: "/test/workspace/pkg",
                },
            ],
        };

        vi.mocked(manypkg.getPackages).mockResolvedValue(mockPackages as any);

        // Act
        const result = await discoverPackages(workspaceRoot);

        // Assert
        expect(result[0].version).toBe("unknown");
    });

    it("should call getPackages with workspace root", async () => {
        // Arrange
        const workspaceRoot = "/test/workspace";
        const mockPackages = {
            packages: [],
        };

        vi.mocked(manypkg.getPackages).mockResolvedValue(mockPackages as any);

        // Act
        await discoverPackages(workspaceRoot);

        // Assert
        expect(manypkg.getPackages).toHaveBeenCalledWith(workspaceRoot);
    });

    it("should rethrow HandledError as is", async () => {
        // Arrange
        const workspaceRoot = "/test/workspace";
        const handledError = new HandledError("Test handled error");

        vi.mocked(manypkg.getPackages).mockRejectedValue(handledError);

        // Act
        const underTest = () => discoverPackages(workspaceRoot);

        // Assert
        await expect(underTest).rejects.toThrow(HandledError);
        await expect(underTest).rejects.toThrow("Test handled error");
    });

    it("should wrap non-HandledError in HandledError", async () => {
        // Arrange
        const workspaceRoot = "/test/workspace";
        const error = new Error("Original error");

        vi.mocked(manypkg.getPackages).mockRejectedValue(error);

        // Act
        const underTest = () => discoverPackages(workspaceRoot);

        // Assert
        await expect(underTest).rejects.toThrow(HandledError);
        await expect(underTest).rejects.toThrow(
            "Failed to discover packages: Original error",
        );
    });
});
