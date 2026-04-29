import {afterEach, describe, expect, it} from "vitest";
import {useColor} from "../use-color";

function restoreEnvVar(envName: string, value: string | undefined) {
    if (value === undefined) {
        delete process.env[envName];
    } else {
        process.env[envName] = value;
    }
}

describe("generateSplash", () => {
    const FORCE_COLOR = process.env.FORCE_COLOR;
    const NO_COLOR = process.env.NO_COLOR;
    const isTTY = process.stdout.isTTY;

    afterEach(() => {
        restoreEnvVar("FORCE_COLOR", FORCE_COLOR);
        restoreEnvVar("NO_COLOR", NO_COLOR);
        process.stdout.isTTY = isTTY;
    });

    it("should return false if NO_COLOR is set", () => {
        // Arrange
        process.env.NO_COLOR = "1";
        delete process.env.FORCE_COLOR;
        process.stdout.isTTY = true;

        // Act
        const result = useColor();

        // Assert
        expect(result).toBe(false);
    });

    it("should return true if FORCE_COLOR is set and NO_COLOR is not set", () => {
        // Arrange
        process.env.FORCE_COLOR = "1";
        delete process.env.NO_COLOR;
        process.stdout.isTTY = false;

        // Act
        const result = useColor();

        // Assert
        expect(result).toBe(true);
    });

    it("should return true if neither NO_COLOR nor FORCE_COLOR is set and stdout is a TTY", () => {
        // Arrange
        delete process.env.NO_COLOR;
        delete process.env.FORCE_COLOR;
        process.stdout.isTTY = true;

        // Act
        const result = useColor();

        // Assert
        expect(result).toBe(true);
    });

    it("should return false if neither NO_COLOR nor FORCE_COLOR is set and stdout is not a TTY", () => {
        // Arrange
        delete process.env.NO_COLOR;
        delete process.env.FORCE_COLOR;
        process.stdout.isTTY = false;

        // Act
        const result = useColor();

        // Assert
        expect(result).toBe(false);
    });
});
