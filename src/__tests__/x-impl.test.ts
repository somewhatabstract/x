import {describe, expect, it} from "vitest";
import {xImpl} from "../x-impl";

describe("xImpl", () => {
    it("should return exit code 1 when script not found", async () => {
        // Arrange
        const scriptName = "nonexistent-script";

        // Act
        const result = await xImpl(scriptName);

        // Assert
        expect(result.exitCode).toBe(1);
    });
});