import {describe, expect, it} from "vitest";
import {findMatchingBins} from "../find-matching-bins";
import type {PackageInfo} from "../discover-packages";

describe("findMatchingBins", () => {
    it("should find bins with object-style bin configuration", async () => {
        const packages: PackageInfo[] = [
            {
                name: "@somewhatabstract/x",
                path: "/home/runner/work/x/x",
                version: "1.0.0",
            },
        ];

        const matches = await findMatchingBins(packages, "x");

        expect(matches).toHaveLength(1);
        expect(matches[0]).toMatchObject({
            packageName: "@somewhatabstract/x",
            binName: "x",
        });
        expect(matches[0].binPath).toContain("dist/x.mjs");
    });

    it("should return empty array when no bins match", async () => {
        const packages: PackageInfo[] = [
            {
                name: "@somewhatabstract/x",
                path: "/home/runner/work/x/x",
                version: "1.0.0",
            },
        ];

        const matches = await findMatchingBins(packages, "nonexistent");

        expect(matches).toHaveLength(0);
    });

    it("should handle packages without bin field", async () => {
        const packages: PackageInfo[] = [
            {
                name: "no-bin-pkg",
                path: "/tmp",
                version: "1.0.0",
            },
        ];

        const matches = await findMatchingBins(packages, "anything");

        expect(matches).toHaveLength(0);
    });
});
