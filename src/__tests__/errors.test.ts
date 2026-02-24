import {describe, expect, it} from "vitest";
import {HandledError} from "../errors";

describe("HandledError", () => {
    it("should be an instance of Error", () => {
        // Arrange
        const error = new HandledError("Test error message");

        // Act
        const isError = error instanceof Error;

        // Assert
        expect(isError).toBe(true);
    });

    it("should have name 'HandledError'", () => {
        // Arrange
        const error = new HandledError("Test error message");

        // Act
        const name = error.name;

        // Assert
        expect(name).toBe("HandledError");
    });

    it("should preserve the error message", () => {
        // Arrange
        const message = "Test error message";

        // Act
        const error = new HandledError(message);

        // Assert
        expect(error.message).toBe(message);
    });

    it("should be distinguishable from HandledError type", () => {
        // Arrange
        const handledError = new HandledError("Handled");

        // Act
        const isHandledError = handledError instanceof HandledError;

        // Assert
        expect(isHandledError).toBe(true);
    });

    it("should distinguish regular errors from HandledError type", () => {
        // Arrange
        const regularError = new Error("Regular");

        // Act
        const isHandledError = regularError instanceof HandledError;

        // Assert
        expect(isHandledError).toBe(false);
    });
});
