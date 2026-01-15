import {describe, expect, it} from "vitest";
import {xImpl} from "../x-impl";

describe("xImpl", () => {
    it("should return exit code 1 when script not found", async () => {
        const result = await xImpl("nonexistent-script");
        expect(result.exitCode).toBe(1);
    });
});