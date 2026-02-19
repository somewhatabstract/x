import {describe, expect, it, vi, beforeEach} from "vitest";
import {xImpl} from "../x-impl";
import * as findWorkspaceRootModule from "../find-workspace-root";
import * as discoverPackagesModule from "../discover-packages";
import * as findMatchingBinsModule from "../find-matching-bins";
import * as executeScriptModule from "../execute-script";
import {HandledError} from "../errors";

// Mock the modules
vi.mock("../find-workspace-root");
vi.mock("../discover-packages");
vi.mock("../find-matching-bins");
vi.mock("../execute-script");

describe("xImpl", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Suppress console output in tests
        vi.spyOn(console, "error").mockImplementation(() => {});
        vi.spyOn(console, "log").mockImplementation(() => {});
    });

    it("should return exit code 1 when script not found", async () => {
        // Arrange
        const scriptName = "nonexistent-script";

        vi.mocked(findWorkspaceRootModule.findWorkspaceRoot).mockResolvedValue(
            "/test/workspace",
        );
        vi.mocked(discoverPackagesModule.discoverPackages).mockResolvedValue([
            {name: "pkg1", path: "/test/pkg1", version: "1.0.0"},
        ]);
        vi.mocked(findMatchingBinsModule.findMatchingBins).mockResolvedValue(
            [],
        );

        // Act
        const result = await xImpl(scriptName);

        // Assert
        expect(result.exitCode).toBe(1);
    });

    it("should return exit code 1 when no packages found", async () => {
        // Arrange
        const scriptName = "test-script";

        vi.mocked(findWorkspaceRootModule.findWorkspaceRoot).mockResolvedValue(
            "/test/workspace",
        );
        vi.mocked(discoverPackagesModule.discoverPackages).mockResolvedValue(
            [],
        );

        // Act
        const result = await xImpl(scriptName);

        // Assert
        expect(result.exitCode).toBe(1);
    });

    it("should return exit code 1 when multiple bins match", async () => {
        // Arrange
        const scriptName = "test-script";

        vi.mocked(findWorkspaceRootModule.findWorkspaceRoot).mockResolvedValue(
            "/test/workspace",
        );
        vi.mocked(discoverPackagesModule.discoverPackages).mockResolvedValue([
            {name: "pkg1", path: "/test/pkg1", version: "1.0.0"},
            {name: "pkg2", path: "/test/pkg2", version: "1.0.0"},
        ]);
        vi.mocked(findMatchingBinsModule.findMatchingBins).mockResolvedValue([
            {
                packageName: "pkg1",
                packagePath: "/test/pkg1",
                binName: "test-script",
                binPath: "/test/pkg1/bin/test",
            },
            {
                packageName: "pkg2",
                packagePath: "/test/pkg2",
                binName: "test-script",
                binPath: "/test/pkg2/bin/test",
            },
        ]);

        // Act
        const result = await xImpl(scriptName);

        // Assert
        expect(result.exitCode).toBe(1);
    });

    it("should execute script in dry-run mode", async () => {
        // Arrange
        const scriptName = "test-script";
        const options = {dryRun: true};

        vi.mocked(findWorkspaceRootModule.findWorkspaceRoot).mockResolvedValue(
            "/test/workspace",
        );
        vi.mocked(discoverPackagesModule.discoverPackages).mockResolvedValue([
            {name: "pkg1", path: "/test/pkg1", version: "1.0.0"},
        ]);
        vi.mocked(findMatchingBinsModule.findMatchingBins).mockResolvedValue([
            {
                packageName: "pkg1",
                packagePath: "/test/pkg1",
                binName: "test-script",
                binPath: "/test/pkg1/bin/test",
            },
        ]);

        // Act
        const result = await xImpl(scriptName, [], options);

        // Assert
        expect(result.exitCode).toBe(0);
    });

    it("should not execute script when dry-run is true", async () => {
        // Arrange
        const scriptName = "test-script";
        const options = {dryRun: true};

        vi.mocked(findWorkspaceRootModule.findWorkspaceRoot).mockResolvedValue(
            "/test/workspace",
        );
        vi.mocked(discoverPackagesModule.discoverPackages).mockResolvedValue([
            {name: "pkg1", path: "/test/pkg1", version: "1.0.0"},
        ]);
        vi.mocked(findMatchingBinsModule.findMatchingBins).mockResolvedValue([
            {
                packageName: "pkg1",
                packagePath: "/test/pkg1",
                binName: "test-script",
                binPath: "/test/pkg1/bin/test",
            },
        ]);

        // Act
        await xImpl(scriptName, [], options);

        // Assert
        expect(executeScriptModule.executeScript).not.toHaveBeenCalled();
    });

    it("should execute script and return its exit code", async () => {
        // Arrange
        const scriptName = "test-script";

        vi.mocked(findWorkspaceRootModule.findWorkspaceRoot).mockResolvedValue(
            "/test/workspace",
        );
        vi.mocked(discoverPackagesModule.discoverPackages).mockResolvedValue([
            {name: "pkg1", path: "/test/pkg1", version: "1.0.0"},
        ]);
        vi.mocked(findMatchingBinsModule.findMatchingBins).mockResolvedValue([
            {
                packageName: "pkg1",
                packagePath: "/test/pkg1",
                binName: "test-script",
                binPath: "/test/pkg1/bin/test",
            },
        ]);
        vi.mocked(executeScriptModule.executeScript).mockResolvedValue(0);

        // Act
        const result = await xImpl(scriptName);

        // Assert
        expect(result.exitCode).toBe(0);
    });

    it("should pass workspace root to executeScript", async () => {
        // Arrange
        const scriptName = "test-script";
        const workspaceRoot = "/test/workspace";

        vi.mocked(findWorkspaceRootModule.findWorkspaceRoot).mockResolvedValue(
            workspaceRoot,
        );
        vi.mocked(discoverPackagesModule.discoverPackages).mockResolvedValue([
            {name: "pkg1", path: "/test/pkg1", version: "1.0.0"},
        ]);
        vi.mocked(findMatchingBinsModule.findMatchingBins).mockResolvedValue([
            {
                packageName: "pkg1",
                packagePath: "/test/pkg1",
                binName: "test-script",
                binPath: "/test/pkg1/bin/test",
            },
        ]);
        vi.mocked(executeScriptModule.executeScript).mockResolvedValue(0);

        // Act
        await xImpl(scriptName);

        // Assert
        expect(executeScriptModule.executeScript).toHaveBeenCalledWith(
            expect.any(Object),
            expect.any(Array),
            workspaceRoot,
        );
    });

    it("should pass args to executeScript", async () => {
        // Arrange
        const scriptName = "test-script";
        const args = ["--flag", "value"];

        vi.mocked(findWorkspaceRootModule.findWorkspaceRoot).mockResolvedValue(
            "/test/workspace",
        );
        vi.mocked(discoverPackagesModule.discoverPackages).mockResolvedValue([
            {name: "pkg1", path: "/test/pkg1", version: "1.0.0"},
        ]);
        vi.mocked(findMatchingBinsModule.findMatchingBins).mockResolvedValue([
            {
                packageName: "pkg1",
                packagePath: "/test/pkg1",
                binName: "test-script",
                binPath: "/test/pkg1/bin/test",
            },
        ]);
        vi.mocked(executeScriptModule.executeScript).mockResolvedValue(0);

        // Act
        await xImpl(scriptName, args);

        // Assert
        expect(executeScriptModule.executeScript).toHaveBeenCalledWith(
            expect.any(Object),
            args,
            expect.any(String),
        );
    });

    it("should return exit code 1 on unhandled error", async () => {
        // Arrange
        const scriptName = "test-script";

        vi.mocked(findWorkspaceRootModule.findWorkspaceRoot).mockRejectedValue(
            new HandledError("Test error"),
        );

        // Act
        const result = await xImpl(scriptName);

        // Assert
        expect(result.exitCode).toBe(1);
    });

    it("should rethrow non-HandledError errors", async () => {
        // Arrange
        const scriptName = "test-script";
        const unexpectedError = new Error("Unexpected error");

        vi.mocked(findWorkspaceRootModule.findWorkspaceRoot).mockRejectedValue(
            unexpectedError,
        );

        // Act
        const underTest = () => xImpl(scriptName);

        // Assert
        await expect(underTest).rejects.toThrow("Unexpected error");
    });
});
