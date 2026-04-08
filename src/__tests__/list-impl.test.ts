import {beforeEach, describe, expect, it, vi} from "vitest";
import * as discoverPackagesModule from "../discover-packages";
import * as findWorkspaceRootModule from "../find-workspace-root";
import * as listBinsModule from "../list-bins";
import {listImpl} from "../list-impl";

vi.mock("../find-workspace-root");
vi.mock("../discover-packages");
vi.mock("../list-bins");

describe("listImpl", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, "log").mockImplementation(() => {});
        vi.spyOn(console, "error").mockImplementation(() => {});

        vi.mocked(findWorkspaceRootModule.findWorkspaceRoot).mockResolvedValue(
            "/workspace",
        );
        vi.mocked(discoverPackagesModule.discoverPackages).mockResolvedValue([
            {
                name: "@scope/pkg-a",
                path: "/workspace/packages/pkg-a",
                version: "1.0.0",
            },
            {
                name: "@scope/pkg-b",
                path: "/workspace/packages/pkg-b",
                version: "1.0.0",
            },
        ]);
        vi.mocked(listBinsModule.listAllBins).mockResolvedValue([
            {
                packageName: "@scope/pkg-a",
                packagePath: "/workspace/packages/pkg-a",
                bins: ["a-script", "d-script"],
            },
            {
                packageName: "@scope/pkg-b",
                packagePath: "/workspace/packages/pkg-b",
                bins: ["c-script", "e-script"],
            },
        ]);
    });

    describe("names-only mode (text)", () => {
        it("should print all script names sorted lexicographically", async () => {
            // Arrange
            // (default beforeEach setup is sufficient)

            // Act
            await listImpl({mode: "names-only", json: false});

            // Assert
            expect(vi.mocked(console.log).mock.calls).toEqual([
                ["a-script"],
                ["c-script"],
                ["d-script"],
                ["e-script"],
            ]);
        });

        it("should print each script name only once when it appears in multiple packages", async () => {
            // Arrange
            vi.mocked(listBinsModule.listAllBins).mockResolvedValue([
                {
                    packageName: "@scope/pkg-a",
                    packagePath: "/workspace/packages/pkg-a",
                    bins: ["shared-tool", "a-only"],
                },
                {
                    packageName: "@scope/pkg-b",
                    packagePath: "/workspace/packages/pkg-b",
                    bins: ["shared-tool", "b-only"],
                },
            ]);

            // Act
            await listImpl({mode: "names-only", json: false});

            // Assert
            const printedNames = vi
                .mocked(console.log)
                .mock.calls.map((c) => c[0]);
            expect(
                printedNames.filter((name) => name === "shared-tool"),
            ).toHaveLength(1);
        });

        it("should return exit code 0", async () => {
            // Arrange
            // (default beforeEach setup is sufficient)

            // Act
            const result = await listImpl({mode: "names-only", json: false});

            // Assert
            expect(result.exitCode).toBe(0);
        });
    });

    describe("names-only mode (JSON)", () => {
        it("should print a single-line JSON array of sorted unique script names", async () => {
            // Arrange
            // (default beforeEach setup is sufficient)

            // Act
            await listImpl({mode: "names-only", json: true});

            // Assert
            expect(console.log).toHaveBeenCalledWith(
                JSON.stringify([
                    "a-script",
                    "c-script",
                    "d-script",
                    "e-script",
                ]),
            );
        });

        it("should return exit code 0", async () => {
            // Arrange
            // (default beforeEach setup is sufficient)

            // Act
            const result = await listImpl({mode: "names-only", json: true});

            // Assert
            expect(result.exitCode).toBe(0);
        });
    });

    describe("full mode (text)", () => {
        it("should output each package header and its scripts", async () => {
            // Arrange
            // (default beforeEach setup is sufficient)

            // Act
            await listImpl({mode: "full", json: false});

            // Assert
            expect(vi.mocked(console.log).mock.calls).toEqual([
                ["@scope/pkg-a (./packages/pkg-a)"],
                ["   a-script"],
                ["   d-script"],
                [],
                ["@scope/pkg-b (./packages/pkg-b)"],
                ["   c-script"],
                ["   e-script"],
                [],
            ]);
        });

        it("should sort packages lexicographically", async () => {
            // Arrange
            vi.mocked(listBinsModule.listAllBins).mockResolvedValue([
                {
                    packageName: "@scope/z-pkg",
                    packagePath: "/workspace/packages/z-pkg",
                    bins: ["z-tool"],
                },
                {
                    packageName: "@scope/a-pkg",
                    packagePath: "/workspace/packages/a-pkg",
                    bins: ["a-tool"],
                },
            ]);

            // Act
            await listImpl({mode: "full", json: false});

            // Assert
            const headerCalls = vi
                .mocked(console.log)
                .mock.calls.map((c) => c[0] as string)
                .filter((c) => c?.startsWith("@scope/"));
            expect(headerCalls).toEqual([
                expect.stringContaining("a-pkg"),
                expect.stringContaining("z-pkg"),
            ]);
        });

        it("should return exit code 0", async () => {
            // Arrange
            // (default beforeEach setup is sufficient)

            // Act
            const result = await listImpl({mode: "full", json: false});

            // Assert
            expect(result.exitCode).toBe(0);
        });
    });

    describe("full mode (JSON)", () => {
        it("should print a single-line JSON object grouped by package name", async () => {
            // Arrange
            // (default beforeEach setup is sufficient)

            // Act
            await listImpl({mode: "full", json: true});

            // Assert
            expect(console.log).toHaveBeenCalledWith(
                JSON.stringify({
                    "@scope/pkg-a": {
                        path: "./packages/pkg-a",
                        scripts: ["a-script", "d-script"],
                    },
                    "@scope/pkg-b": {
                        path: "./packages/pkg-b",
                        scripts: ["c-script", "e-script"],
                    },
                }),
            );
        });

        it("should return exit code 0", async () => {
            // Arrange
            // (default beforeEach setup is sufficient)

            // Act
            const result = await listImpl({mode: "full", json: true});

            // Assert
            expect(result.exitCode).toBe(0);
        });
    });

    describe("error handling", () => {
        it("should throw HandledError when no packages are found in the workspace", async () => {
            // Arrange
            vi.mocked(
                discoverPackagesModule.discoverPackages,
            ).mockResolvedValue([]);

            // Act/Assert
            await expect(
                listImpl({mode: "names-only", json: false}),
            ).rejects.toThrow("No packages found in workspace");
        });

        it("should propagate unexpected errors", async () => {
            // Arrange
            const unexpectedError = new Error("Unexpected failure");
            vi.mocked(
                findWorkspaceRootModule.findWorkspaceRoot,
            ).mockRejectedValue(unexpectedError);

            // Act
            const underTest = () => listImpl({mode: "names-only", json: false});

            // Assert
            await expect(underTest).rejects.toThrow("Unexpected failure");
        });
    });
});
