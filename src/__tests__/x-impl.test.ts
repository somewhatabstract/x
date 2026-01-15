import {describe, expect, it} from "vitest";
import {xImpl} from "../x-impl";

describe("xImpl", () => {
    it("should throw an error when no script name is provided", async () => {
        // We need to test with proper arguments now
        // This test needs to be updated to match the new API
        await expect(xImpl("nonexistent-script")).rejects.toThrow();
    });
});