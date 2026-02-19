import {describe, expect, it, vi} from "vitest";
import {xImpl} from "../x-impl";

describe("xImpl", () => {
    it("should log 'Hello, world!'", () => {
        // Arrange
        const consoleSpy = vi.spyOn(console, "log");

        // Act
        xImpl();

        // Assert
        expect(consoleSpy).toHaveBeenCalledWith("Hello, world!");
    });
});
