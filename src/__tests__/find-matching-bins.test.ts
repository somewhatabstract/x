import {describe, expect, it} from "vitest";
import {findMatchingBins} from "../find-matching-bins";
import type {PackageInfo} from "../discover-packages";

describe("findMatchingBins", () => {
    it("should find one matching bin with object-style bin configuration", async () => {
        // Arrange
        const packages: PackageInfo[] = [
            {
                name: "@somewhatabstract/x",
                path: "/home/runner/work/x/x",
                version: "1.0.0",
            },
        ];

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
                path: "/home/runner/work/x/x",
                version: "1.0.0",
            },
        ];

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
                path: "/home/runner/work/x/x",
                version: "1.0.0",
            },
        ];

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
                path: "/home/runner/work/x/x",
                version: "1.0.0",
            },
        ];

        // Act
        const matches = await findMatchingBins(packages, "x");

        // Assert
        expect(matches[0].binPath).toContain("dist/x.mjs");
    });

    it("should return empty array when no bins match", async () => {
        // Arrange
        const packages: PackageInfo[] = [
            {
                name: "@somewhatabstract/x",
                path: "/home/runner/work/x/x",
                version: "1.0.0",
            },
        ];

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
                path: "/tmp",
                version: "1.0.0",
            },
        ];

        // Act
        const matches = await findMatchingBins(packages, "anything");

        // Assert
        expect(matches).toHaveLength(0);
    });
});
