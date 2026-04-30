import {describe, expect, it} from "vitest";
import type {Arguments} from "yargs";
import {validateArgv} from "../validate-argv";

function makeArgv(
    overrides: Partial<{
        list: string | undefined;
        json: boolean;
        dryRun: boolean;
        "script-name": string | undefined;
    }>,
): Arguments {
    return {
        list: undefined,
        json: false,
        dryRun: false,
        "script-name": undefined,
        _: [],
        $0: "x",
        ...overrides,
    } as unknown as Arguments;
}

describe("validateArgv", () => {
    it("should return true when a script name is provided", () => {
        // Arrange
        const argv = makeArgv({"script-name": "my-script"});

        // Act
        const result = validateArgv(argv);

        // Assert
        expect(result).toBe(true);
    });

    it("should return true when --list is provided without a script name", () => {
        // Arrange
        const argv = makeArgv({list: ""});

        // Act
        const result = validateArgv(argv);

        // Assert
        expect(result).toBe(true);
    });

    it("should return true when --list=full is provided", () => {
        // Arrange
        const argv = makeArgv({list: "full"});

        // Act
        const result = validateArgv(argv);

        // Assert
        expect(result).toBe(true);
    });

    it("should throw when no script name and no --list is provided", () => {
        // Arrange
        const argv = makeArgv({});

        // Act
        const act = () => validateArgv(argv);

        // Assert
        expect(act).toThrow(
            "script-name is required. Use --list to see available commands.",
        );
    });

    it("should throw when script name is only whitespace", () => {
        // Arrange
        const argv = makeArgv({"script-name": "   "});

        // Act
        const act = () => validateArgv(argv);

        // Assert
        expect(act).toThrow(
            "script-name is required. Use --list to see available commands.",
        );
    });

    it("should return true when --list and --json are combined", () => {
        // Arrange
        const argv = makeArgv({list: "", json: true});

        // Act
        const result = validateArgv(argv);

        // Assert
        expect(result).toBe(true);
    });

    it("should throw when --json is used without --list", () => {
        // Arrange
        const argv = makeArgv({"script-name": "my-script", json: true});

        // Act
        const act = () => validateArgv(argv);

        // Assert
        expect(act).toThrow("--json requires --list to be specified.");
    });

    it("should return true when --dry-run is used with a script name", () => {
        // Arrange
        const argv = makeArgv({"script-name": "my-script", dryRun: true});

        // Act
        const result = validateArgv(argv);

        // Assert
        expect(result).toBe(true);
    });

    it("should throw when --dry-run is combined with --list", () => {
        // Arrange
        const argv = makeArgv({list: "", dryRun: true});

        // Act
        const act = () => validateArgv(argv);

        // Assert
        expect(act).toThrow("--dry-run cannot be used with --list.");
    });
});
