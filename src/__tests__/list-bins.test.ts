import {beforeEach, describe, expect, it, vi} from "vitest";
import {listAllBins} from "../list-bins";

// Mock the fs module
vi.mock("node:fs/promises", () => ({
    readFile: vi.fn(),
}));

import * as fs from "node:fs/promises";

describe("listAllBins", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, "warn").mockImplementation(() => {});
    });

    it("should return empty array when packages list is empty", async () => {
        // Arrange
        // (no arrangement needed)

        // Act
        const result = await listAllBins([]);

        // Assert
        expect(result).toEqual([]);
    });

    it("should return bins for a package with a string bin entry", async () => {
        // Arrange
        vi.mocked(fs.readFile).mockResolvedValue(
            JSON.stringify({
                name: "my-pkg",
                bin: "./dist/index.js",
            }),
        );

        // Act
        const result = await listAllBins([
            {name: "my-pkg", path: "/workspace/my-pkg", version: "1.0.0"},
        ]);

        // Assert
        expect(result).toEqual([
            {
                packageName: "my-pkg",
                packagePath: "/workspace/my-pkg",
                bins: ["my-pkg"],
            },
        ]);
    });

    it("should return bins for a package with an object bin entry", async () => {
        // Arrange
        vi.mocked(fs.readFile).mockResolvedValue(
            JSON.stringify({
                name: "my-pkg",
                bin: {
                    "tool-a": "./dist/tool-a.js",
                    "tool-b": "./dist/tool-b.js",
                },
            }),
        );

        // Act
        const result = await listAllBins([
            {name: "my-pkg", path: "/workspace/my-pkg", version: "1.0.0"},
        ]);

        // Assert
        expect(result).toEqual([
            {
                packageName: "my-pkg",
                packagePath: "/workspace/my-pkg",
                bins: ["tool-a", "tool-b"],
            },
        ]);
    });

    it("should sort bins alphabetically within each package", async () => {
        // Arrange
        vi.mocked(fs.readFile).mockResolvedValue(
            JSON.stringify({
                name: "my-pkg",
                bin: {
                    "z-tool": "./z.js",
                    "a-tool": "./a.js",
                    "m-tool": "./m.js",
                },
            }),
        );

        // Act
        const result = await listAllBins([
            {name: "my-pkg", path: "/workspace/my-pkg", version: "1.0.0"},
        ]);

        // Assert
        expect(result[0].bins).toEqual(["a-tool", "m-tool", "z-tool"]);
    });

    it("should not include packages with no bin field", async () => {
        // Arrange
        vi.mocked(fs.readFile).mockResolvedValue(
            JSON.stringify({name: "my-pkg"}),
        );

        // Act
        const result = await listAllBins([
            {name: "my-pkg", path: "/workspace/my-pkg", version: "1.0.0"},
        ]);

        // Assert
        expect(result).toEqual([]);
    });

    it("should not include packages with a null bin field", async () => {
        // Arrange
        vi.mocked(fs.readFile).mockResolvedValue(
            JSON.stringify({name: "my-pkg", bin: null}),
        );

        // Act
        const result = await listAllBins([
            {name: "my-pkg", path: "/workspace/my-pkg", version: "1.0.0"},
        ]);

        // Assert
        expect(result).toEqual([]);
    });

    it("should include an entry for each package that has bins", async () => {
        // Arrange
        vi.mocked(fs.readFile)
            .mockResolvedValueOnce(
                JSON.stringify({
                    name: "pkg-a",
                    bin: {"tool-a": "./a.js"},
                }),
            )
            .mockResolvedValueOnce(
                JSON.stringify({
                    name: "pkg-b",
                    bin: {"tool-b": "./b.js"},
                }),
            );

        // Act
        const result = await listAllBins([
            {name: "pkg-a", path: "/workspace/pkg-a", version: "1.0.0"},
            {name: "pkg-b", path: "/workspace/pkg-b", version: "1.0.0"},
        ]);

        // Assert
        expect(result.map((r) => r.packageName)).toEqual(["pkg-a", "pkg-b"]);
    });

    it("should not include a package when its package.json cannot be found", async () => {
        // Arrange
        const err = Object.assign(new Error("ENOENT"), {code: "ENOENT"});
        vi.mocked(fs.readFile).mockRejectedValue(err);

        // Act
        const result = await listAllBins([
            {name: "pkg-a", path: "/workspace/pkg-a", version: "1.0.0"},
        ]);

        // Assert
        expect(result).toEqual([]);
    });

    it("should not warn when a package.json cannot be found", async () => {
        // Arrange
        const err = Object.assign(new Error("ENOENT"), {code: "ENOENT"});
        vi.mocked(fs.readFile).mockRejectedValue(err);

        // Act
        await listAllBins([
            {name: "pkg-a", path: "/workspace/pkg-a", version: "1.0.0"},
        ]);

        // Assert
        expect(console.warn).not.toHaveBeenCalled();
    });

    it("should not include a package when its package.json contains invalid JSON", async () => {
        // Arrange
        vi.mocked(fs.readFile).mockResolvedValue("not valid json");

        // Act
        const result = await listAllBins([
            {name: "pkg-a", path: "/workspace/pkg-a", version: "1.0.0"},
        ]);

        // Assert
        expect(result).toEqual([]);
    });

    it("should warn when a package.json contains invalid JSON", async () => {
        // Arrange
        vi.mocked(fs.readFile).mockResolvedValue("not valid json");

        // Act
        await listAllBins([
            {name: "pkg-a", path: "/workspace/pkg-a", version: "1.0.0"},
        ]);

        // Assert
        expect(console.warn).toHaveBeenCalledWith(
            expect.stringContaining("invalid JSON"),
        );
    });

    it("should not include a package when its package.json cannot be read", async () => {
        // Arrange
        vi.mocked(fs.readFile).mockRejectedValue(new Error("disk error"));

        // Act
        const result = await listAllBins([
            {name: "pkg-a", path: "/workspace/pkg-a", version: "1.0.0"},
        ]);

        // Assert
        expect(result).toEqual([]);
    });

    it("should warn when a package.json cannot be read", async () => {
        // Arrange
        vi.mocked(fs.readFile).mockRejectedValue(new Error("disk error"));

        // Act
        await listAllBins([
            {name: "pkg-a", path: "/workspace/pkg-a", version: "1.0.0"},
        ]);

        // Assert
        expect(console.warn).toHaveBeenCalledWith(
            expect.stringContaining("Could not read package.json"),
            expect.any(Error),
        );
    });
});
