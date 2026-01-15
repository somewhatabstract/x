import {describe, expect, it} from "vitest";
import {HandledError} from "../errors";

describe("HandledError", () => {
    it("should create an error with the correct name and message", () => {
        const error = new HandledError("Test error message");

        expect(error).toBeInstanceOf(Error);
        expect(error.name).toBe("HandledError");
        expect(error.message).toBe("Test error message");
    });

    it("should be distinguishable from regular errors", () => {
        const handledError = new HandledError("Handled");
        const regularError = new Error("Regular");

        expect(handledError).toBeInstanceOf(HandledError);
        expect(regularError).not.toBeInstanceOf(HandledError);
    });
});
