import {describe, expect, it} from "vitest";
import {isNodeExecutable} from "../is-node-executable";

describe("isNodeExecutable", () => {
    it("should return true for .js files", () => {
        // Arrange
        const binPath = "/path/to/script.js";

        // Act
        const result = isNodeExecutable(binPath);

        // Assert
        expect(result).toBe(true);
    });

    it("should return true for .mjs files", () => {
        // Arrange
        const binPath = "/path/to/script.mjs";

        // Act
        const result = isNodeExecutable(binPath);

        // Assert
        expect(result).toBe(true);
    });

    it("should return true for .cjs files", () => {
        // Arrange
        const binPath = "/path/to/script.cjs";

        // Act
        const result = isNodeExecutable(binPath);

        // Assert
        expect(result).toBe(true);
    });

    it("should return true for .JS files (case-insensitive)", () => {
        // Arrange
        const binPath = "/path/to/script.JS";

        // Act
        const result = isNodeExecutable(binPath);

        // Assert
        expect(result).toBe(true);
    });

    it("should return true for .Js files (case-insensitive)", () => {
        // Arrange
        const binPath = "/path/to/script.Js";

        // Act
        const result = isNodeExecutable(binPath);

        // Assert
        expect(result).toBe(true);
    });

    it("should return true for .MJS files (case-insensitive)", () => {
        // Arrange
        const binPath = "/path/to/script.MJS";

        // Act
        const result = isNodeExecutable(binPath);

        // Assert
        expect(result).toBe(true);
    });

    it("should return true for .CJS files (case-insensitive)", () => {
        // Arrange
        const binPath = "/path/to/script.CJS";

        // Act
        const result = isNodeExecutable(binPath);

        // Assert
        expect(result).toBe(true);
    });

    it("should return true for .Mjs files (case-insensitive)", () => {
        // Arrange
        const binPath = "/path/to/script.Mjs";

        // Act
        const result = isNodeExecutable(binPath);

        // Assert
        expect(result).toBe(true);
    });

    it("should return false for files with no extension", () => {
        // Arrange
        const binPath = "/path/to/script";

        // Act
        const result = isNodeExecutable(binPath);

        // Assert
        expect(result).toBe(false);
    });

    it("should return false for .sh files", () => {
        // Arrange
        const binPath = "/path/to/script.sh";

        // Act
        const result = isNodeExecutable(binPath);

        // Assert
        expect(result).toBe(false);
    });

    it("should return false for files with .js in the middle (e.g. script.js.bak)", () => {
        // Arrange
        const binPath = "/path/to/script.js.bak";

        // Act
        const result = isNodeExecutable(binPath);

        // Assert
        expect(result).toBe(false);
    });
});
