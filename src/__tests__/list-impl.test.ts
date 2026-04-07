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
        it("should print each script name on its own line sorted lexicographically", async () => {
            await listImpl({mode: "names-only", json: false});

            expect(console.log).toHaveBeenCalledWith("a-script");
            expect(console.log).toHaveBeenCalledWith("c-script");
            expect(console.log).toHaveBeenCalledWith("d-script");
            expect(console.log).toHaveBeenCalledWith("e-script");
        });

        it("should deduplicate script names that appear in multiple packages", async () => {
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

            await listImpl({mode: "names-only", json: false});

            const calls = vi.mocked(console.log).mock.calls.map((c) => c[0]);
            const sharedCalls = calls.filter((c) => c === "shared-tool");
            expect(sharedCalls).toHaveLength(1);
        });

        it("should return exit code 0", async () => {
            const result = await listImpl({mode: "names-only", json: false});
            expect(result.exitCode).toBe(0);
        });
    });

    describe("names-only mode (JSON)", () => {
        it("should print a single-line JSON array of sorted unique script names", async () => {
            await listImpl({mode: "names-only", json: true});

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
            const result = await listImpl({mode: "names-only", json: true});
            expect(result.exitCode).toBe(0);
        });
    });

    describe("full mode (text)", () => {
        it("should print package header and indented script names", async () => {
            await listImpl({mode: "full", json: false});

            expect(console.log).toHaveBeenCalledWith(
                "@scope/pkg-a (./packages/pkg-a)",
            );
            expect(console.log).toHaveBeenCalledWith("   a-script");
            expect(console.log).toHaveBeenCalledWith("   d-script");
            expect(console.log).toHaveBeenCalledWith(
                "@scope/pkg-b (./packages/pkg-b)",
            );
            expect(console.log).toHaveBeenCalledWith("   c-script");
            expect(console.log).toHaveBeenCalledWith("   e-script");
        });

        it("should sort packages lexicographically", async () => {
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

            await listImpl({mode: "full", json: false});

            const calls = vi
                .mocked(console.log)
                .mock.calls.map((c) => c[0] as string);
            const headerCalls = calls.filter((c) => c?.startsWith("@scope/"));
            expect(headerCalls[0]).toContain("a-pkg");
            expect(headerCalls[1]).toContain("z-pkg");
        });

        it("should return exit code 0", async () => {
            const result = await listImpl({mode: "full", json: false});
            expect(result.exitCode).toBe(0);
        });
    });

    describe("full mode (JSON)", () => {
        it("should print a single-line JSON object grouped by package name", async () => {
            await listImpl({mode: "full", json: true});

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
            const result = await listImpl({mode: "full", json: true});
            expect(result.exitCode).toBe(0);
        });
    });

    describe("error handling", () => {
        it("should return exit code 1 when no packages are found", async () => {
            vi.mocked(
                discoverPackagesModule.discoverPackages,
            ).mockResolvedValue([]);

            const result = await listImpl({mode: "names-only", json: false});

            expect(result.exitCode).toBe(1);
            expect(console.error).toHaveBeenCalledWith(
                expect.stringContaining("No packages found"),
            );
        });

        it("should rethrow non-HandledError errors", async () => {
            const unexpectedError = new Error("Unexpected failure");
            vi.mocked(
                findWorkspaceRootModule.findWorkspaceRoot,
            ).mockRejectedValue(unexpectedError);

            await expect(
                listImpl({mode: "names-only", json: false}),
            ).rejects.toThrow("Unexpected failure");
        });
    });
});
