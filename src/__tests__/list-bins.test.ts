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
        const result = await listAllBins([]);
        expect(result).toEqual([]);
    });

    it("should return bins for a package with a string bin entry", async () => {
        vi.mocked(fs.readFile).mockResolvedValue(
            JSON.stringify({
                name: "my-pkg",
                bin: "./dist/index.js",
            }),
        );

        const result = await listAllBins([
            {name: "my-pkg", path: "/workspace/my-pkg", version: "1.0.0"},
        ]);

        expect(result).toEqual([
            {
                packageName: "my-pkg",
                packagePath: "/workspace/my-pkg",
                bins: ["my-pkg"],
            },
        ]);
    });

    it("should return bins for a package with an object bin entry", async () => {
        vi.mocked(fs.readFile).mockResolvedValue(
            JSON.stringify({
                name: "my-pkg",
                bin: {
                    "tool-a": "./dist/tool-a.js",
                    "tool-b": "./dist/tool-b.js",
                },
            }),
        );

        const result = await listAllBins([
            {name: "my-pkg", path: "/workspace/my-pkg", version: "1.0.0"},
        ]);

        expect(result).toEqual([
            {
                packageName: "my-pkg",
                packagePath: "/workspace/my-pkg",
                bins: ["tool-a", "tool-b"],
            },
        ]);
    });

    it("should sort bins alphabetically within each package", async () => {
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

        const result = await listAllBins([
            {name: "my-pkg", path: "/workspace/my-pkg", version: "1.0.0"},
        ]);

        expect(result[0].bins).toEqual(["a-tool", "m-tool", "z-tool"]);
    });

    it("should skip packages with no bin field", async () => {
        vi.mocked(fs.readFile).mockResolvedValue(
            JSON.stringify({name: "my-pkg"}),
        );

        const result = await listAllBins([
            {name: "my-pkg", path: "/workspace/my-pkg", version: "1.0.0"},
        ]);

        expect(result).toEqual([]);
    });

    it("should skip packages with null bin field", async () => {
        vi.mocked(fs.readFile).mockResolvedValue(
            JSON.stringify({name: "my-pkg", bin: null}),
        );

        const result = await listAllBins([
            {name: "my-pkg", path: "/workspace/my-pkg", version: "1.0.0"},
        ]);

        expect(result).toEqual([]);
    });

    it("should handle multiple packages and return all with bins", async () => {
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

        const result = await listAllBins([
            {name: "pkg-a", path: "/workspace/pkg-a", version: "1.0.0"},
            {name: "pkg-b", path: "/workspace/pkg-b", version: "1.0.0"},
        ]);

        expect(result).toHaveLength(2);
        expect(result[0].packageName).toBe("pkg-a");
        expect(result[1].packageName).toBe("pkg-b");
    });

    it("should skip packages whose package.json cannot be found (ENOENT)", async () => {
        const err = Object.assign(new Error("ENOENT"), {code: "ENOENT"});
        vi.mocked(fs.readFile).mockRejectedValue(err);

        const result = await listAllBins([
            {name: "pkg-a", path: "/workspace/pkg-a", version: "1.0.0"},
        ]);

        expect(result).toEqual([]);
        expect(console.warn).not.toHaveBeenCalled();
    });

    it("should warn and skip packages with invalid JSON in package.json", async () => {
        vi.mocked(fs.readFile).mockResolvedValue("not valid json");

        const result = await listAllBins([
            {name: "pkg-a", path: "/workspace/pkg-a", version: "1.0.0"},
        ]);

        expect(result).toEqual([]);
        expect(console.warn).toHaveBeenCalledWith(
            expect.stringContaining("invalid JSON"),
        );
    });

    it("should warn and skip packages when readFile throws an unexpected error", async () => {
        vi.mocked(fs.readFile).mockRejectedValue(new Error("disk error"));

        const result = await listAllBins([
            {name: "pkg-a", path: "/workspace/pkg-a", version: "1.0.0"},
        ]);

        expect(result).toEqual([]);
        expect(console.warn).toHaveBeenCalledWith(
            expect.stringContaining("Could not read package.json"),
            expect.any(Error),
        );
    });
});
