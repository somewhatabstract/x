import {describe, expect, it} from "vitest";
import {hasCommandAlreadyTyped} from "../has-command-already-typed";

describe("hasCommandAlreadyTyped", () => {
    it("should return false when the completion flag is absent", () => {
        // Arrange
        const rawArgs = ["x", "my-tool"];

        // Act
        const result = hasCommandAlreadyTyped(rawArgs);

        // Assert
        expect(result).toBe(false);
    });

    it("should return false when no words have been typed yet", () => {
        // Arrange
        const rawArgs = ["--get-yargs-completions", "x", ""];

        // Act
        const result = hasCommandAlreadyTyped(rawArgs);

        // Assert
        expect(result).toBe(false);
    });

    it("should return false when only x flags have been typed", () => {
        // Arrange
        const rawArgs = ["--get-yargs-completions", "x", "--dry-run", ""];

        // Act
        const result = hasCommandAlreadyTyped(rawArgs);

        // Assert
        expect(result).toBe(false);
    });

    it("should return false when a word is currently being partially typed", () => {
        // Arrange
        const rawArgs = ["--get-yargs-completions", "x", "my"];

        // Act
        const result = hasCommandAlreadyTyped(rawArgs);

        // Assert
        expect(result).toBe(false);
    });

    it("should return true when a command has been fully typed", () => {
        // Arrange
        const rawArgs = ["--get-yargs-completions", "x", "my-tool", ""];

        // Act
        const result = hasCommandAlreadyTyped(rawArgs);

        // Assert
        expect(result).toBe(true);
    });

    it("should return true when a command has been typed followed by additional args", () => {
        // Arrange
        const rawArgs = [
            "--get-yargs-completions",
            "x",
            "my-tool",
            "--some-arg",
            "",
        ];

        // Act
        const result = hasCommandAlreadyTyped(rawArgs);

        // Assert
        expect(result).toBe(true);
    });

    it("should return true when a command has been typed after x flags", () => {
        // Arrange
        const rawArgs = [
            "--get-yargs-completions",
            "x",
            "--dry-run",
            "my-tool",
            "",
        ];

        // Act
        const result = hasCommandAlreadyTyped(rawArgs);

        // Assert
        expect(result).toBe(true);
    });
});
