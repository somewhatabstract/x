import {describe, expect, it, vi, beforeEach} from "vitest";
import {findMatchingBins} from "../find-matching-bins";
import type {PackageInfo} from "../discover-packages";

// Mock the fs module
vi.mock("node:fs/promises", () => ({
    readFile: vi.fn(),
}));

import * as fs from "node:fs/promises";

describe("findMatchingBins", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should find one matching bin with object-style bin configuration", async () => {
        // Arrange
        const packages: PackageInfo[] = [
            {
                name: "@somewhatabstract/x",
                path: "/test/path",
                version: "1.0.0",
            },
        ];

        vi.mocked(fs.readFile).mockResolvedValue(
            JSON.stringify({
                name: "@somewhatabstract/x",
                bin: {
                    x: "./dist/x.mjs",
                },
            }),
        );

        // Act
        const matches = await findMatchingBins(packages, "x");

        // Assert
        expect(matches).toHaveLength(1);
    });

    it("should match the correct package name", async () => {
        // Arrange
        const packages: PackageInfo[] = [
            {
                name: "@somewhatabstract/x",
                path: "/test/path",
                version: "1.0.0",
            },
        ];

        vi.mocked(fs.readFile).mockResolvedValue(
            JSON.stringify({
                name: "@somewhatabstract/x",
                bin: {
                    x: "./dist/x.mjs",
                },
            }),
        );

        // Act
        const matches = await findMatchingBins(packages, "x");

        // Assert
        expect(matches[0].packageName).toBe("@somewhatabstract/x");
    });

    it("should match the correct bin name", async () => {
        // Arrange
        const packages: PackageInfo[] = [
            {
                name: "@somewhatabstract/x",
                path: "/test/path",
                version: "1.0.0",
            },
        ];

        vi.mocked(fs.readFile).mockResolvedValue(
            JSON.stringify({
                name: "@somewhatabstract/x",
                bin: {
                    x: "./dist/x.mjs",
                },
            }),
        );

        // Act
        const matches = await findMatchingBins(packages, "x");

        // Assert
        expect(matches[0].binName).toBe("x");
    });

    it("should include the bin path in the match", async () => {
        // Arrange
        const packages: PackageInfo[] = [
            {
                name: "@somewhatabstract/x",
                path: "/test/path",
                version: "1.0.0",
            },
        ];

        vi.mocked(fs.readFile).mockResolvedValue(
            JSON.stringify({
                name: "@somewhatabstract/x",
                bin: {
                    x: "./dist/x.mjs",
                },
            }),
        );

        // Act
        const matches = await findMatchingBins(packages, "x");

        // Assert
        expect(matches[0].binPath).toBe("/test/path/dist/x.mjs");
    });

    it("should return empty array when no bins match", async () => {
        // Arrange
        const packages: PackageInfo[] = [
            {
                name: "@somewhatabstract/x",
                path: "/test/path",
                version: "1.0.0",
            },
        ];

        vi.mocked(fs.readFile).mockResolvedValue(
            JSON.stringify({
                name: "@somewhatabstract/x",
                bin: {
                    x: "./dist/x.mjs",
                },
            }),
        );

        // Act
        const matches = await findMatchingBins(packages, "nonexistent");

        // Assert
        expect(matches).toHaveLength(0);
    });

    it("should handle packages without bin field", async () => {
        // Arrange
        const packages: PackageInfo[] = [
            {
                name: "no-bin-pkg",
                path: "/test/path",
                version: "1.0.0",
            },
        ];

        vi.mocked(fs.readFile).mockResolvedValue(
            JSON.stringify({
                name: "no-bin-pkg",
            }),
        );

        // Act
        const matches = await findMatchingBins(packages, "anything");

        // Assert
        expect(matches).toHaveLength(0);
    });

    it("should handle packages with string-style bin configuration", async () => {
        // Arrange
        const packages: PackageInfo[] = [
            {
                name: "my-cli",
                path: "/test/path",
                version: "1.0.0",
            },
        ];

        vi.mocked(fs.readFile).mockResolvedValue(
            JSON.stringify({
                name: "my-cli",
                bin: "./bin/cli.js",
            }),
        );

        // Act
        const matches = await findMatchingBins(packages, "my-cli");

        // Assert
        expect(matches).toHaveLength(1);
    });

    it("should skip packages that cannot be read", async () => {
        // Arrange
        const packages: PackageInfo[] = [
            {
                name: "unreadable-pkg",
                path: "/test/path",
                version: "1.0.0",
            },
        ];

        vi.mocked(fs.readFile).mockRejectedValue(
            new Error("ENOENT: no such file or directory"),
        );

        // Act
        const matches = await findMatchingBins(packages, "anything");

        // Assert
        expect(matches).toHaveLength(0);
    });
});
