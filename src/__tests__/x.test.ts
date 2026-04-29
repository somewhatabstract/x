import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {main} from "../bin/x";
import {HandledError} from "../errors";
import {listImpl} from "../list-impl";
import {outputHelpWithSplash} from "../output-help-with-splash";
import {xImpl} from "../x-impl";

vi.mock("../x-impl");

vi.mock("../list-impl");

vi.mock("../output-help-with-splash");

describe("bin/x", () => {
    const xImplMock = vi.mocked(xImpl);
    const listImplMock = vi.mocked(listImpl);
    const outputHelpWithSplashMock = vi.mocked(outputHelpWithSplash);

    beforeEach(() => {
        xImplMock.mockReset();
        listImplMock.mockReset();
        outputHelpWithSplashMock.mockReset();
        vi.spyOn(console, "error").mockImplementation(() => {});
        vi.spyOn(console, "warn").mockImplementation(() => {});
        vi.spyOn(process, "exit").mockImplementation((() => {
            throw new Error("process.exit called");
        }) as never);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should call xImpl with the script name from argv", async () => {
        // Arrange
        xImplMock.mockResolvedValue({exitCode: 0});

        // Act
        await main(["node", "x.mjs", "my-script"]);

        // Assert
        expect(xImplMock).toHaveBeenCalledWith(
            "my-script",
            expect.any(Array),
            expect.any(Object),
        );
        expect(console.warn).not.toHaveBeenCalled();
    });

    it("should call xImpl with args from argv underscore field", async () => {
        // Arrange
        xImplMock.mockResolvedValue({exitCode: 0});

        // Act
        await main(["node", "x.mjs", "my-script", "--", "--flag", "value"]);

        // Assert
        expect(xImplMock).toHaveBeenCalledWith(
            expect.any(String),
            ["--flag", "value"],
            expect.any(Object),
        );
        expect(console.warn).not.toHaveBeenCalled();
    });

    it("should call xImpl with dryRun true when dry-run argv is true", async () => {
        // Arrange
        xImplMock.mockResolvedValue({exitCode: 0});

        // Act
        await main(["node", "x.mjs", "--dry-run", "my-script"]);

        // Assert
        expect(xImplMock).toHaveBeenCalledWith(
            expect.any(String),
            expect.any(Array),
            {dryRun: true},
        );
        expect(console.warn).not.toHaveBeenCalled();
    });

    it("should call xImpl with dryRun false when dry-run argv is false", async () => {
        // Arrange
        xImplMock.mockResolvedValue({exitCode: 0});

        // Act
        await main(["node", "x.mjs", "my-script"]);

        // Assert
        expect(xImplMock).toHaveBeenCalledWith(
            expect.any(String),
            expect.any(Array),
            {dryRun: false},
        );
        expect(console.warn).not.toHaveBeenCalled();
    });

    it("should default to empty args when no extra argv values are provided", async () => {
        // Arrange
        xImplMock.mockResolvedValue({exitCode: 0});

        // Act
        await main(["node", "x.mjs", "my-script"]);

        // Assert
        expect(xImplMock).toHaveBeenCalledWith(
            expect.any(String),
            [],
            expect.any(Object),
        );
        expect(console.warn).not.toHaveBeenCalled();
    });

    it("should return the exit code returned by xImpl", async () => {
        // Arrange
        xImplMock.mockResolvedValue({exitCode: 42});

        // Act
        const result = await main(["node", "x.mjs", "my-script"]);

        // Assert
        expect(result.exitCode).toBe(42);
        expect(console.warn).not.toHaveBeenCalled();
    });

    it("should reject when xImpl throws an unexpected error", async () => {
        // Arrange
        xImplMock.mockRejectedValue(new Error("Unexpected"));

        await expect(main(["node", "x.mjs", "my-script"])).rejects.toThrow(
            "Unexpected",
        );
    });

    it("should propagate the original error when xImpl throws", async () => {
        // Arrange
        const unexpectedError = new Error("Something went wrong");
        xImplMock.mockRejectedValue(unexpectedError);

        await expect(main(["node", "x.mjs", "my-script"])).rejects.toBe(
            unexpectedError,
        );
    });

    it("should pass unknown flag args to xImpl when user omits --", async () => {
        // Arrange
        xImplMock.mockResolvedValue({exitCode: 0});

        // Act
        await main(["node", "x.mjs", "my-script", "--unknown-flag", "value"]);

        // Assert
        expect(xImplMock).toHaveBeenCalledWith(
            "my-script",
            ["--unknown-flag", "value"],
            expect.any(Object),
        );
    });

    it("should show a tip when args contain flags and -- was not used", async () => {
        // Arrange
        xImplMock.mockResolvedValue({exitCode: 0});

        // Act
        await main(["node", "x.mjs", "my-script", "--unknown-flag", "value"]);

        // Assert
        expect(console.warn).toHaveBeenCalledWith(
            `Tip: To pass flags to "my-script", use '--' to separate them:`,
        );
    });

    it("should show the corrected command in the tip when args contain flags without --", async () => {
        // Arrange
        xImplMock.mockResolvedValue({exitCode: 0});

        // Act
        await main(["node", "x.mjs", "my-script", "--unknown-flag", "value"]);

        // Assert
        expect(console.warn).toHaveBeenCalledWith(
            "  x my-script -- --unknown-flag value",
        );
    });

    it("should not show a tip when -- was used before flag args", async () => {
        // Arrange
        xImplMock.mockResolvedValue({exitCode: 0});

        // Act
        await main([
            "node",
            "x.mjs",
            "my-script",
            "--",
            "--unknown-flag",
            "value",
        ]);

        // Assert
        expect(console.warn).not.toHaveBeenCalled();
    });

    it("should not show a tip when args contain no flag-like values", async () => {
        // Arrange
        xImplMock.mockResolvedValue({exitCode: 0});

        // Act
        await main([
            "node",
            "x.mjs",
            "my-script",
            "positional-arg",
            "another-arg",
        ]);

        // Assert
        expect(console.warn).not.toHaveBeenCalled();
    });

    it("should pass positional args to xImpl when user omits --", async () => {
        // Arrange
        xImplMock.mockResolvedValue({exitCode: 0});

        // Act
        await main(["node", "x.mjs", "e2e", "setup", "verify"]);

        // Assert
        expect(xImplMock).toHaveBeenCalledWith(
            "e2e",
            ["setup", "verify"],
            expect.any(Object),
        );
        expect(console.warn).not.toHaveBeenCalled();
    });

    it("should return success when help is requested with --help", async () => {
        // Arrange
        xImplMock.mockResolvedValue({exitCode: 99});

        // Act
        const result = await main(["node", "x.mjs", "my-script", "--help"]);

        // Assert
        expect(result).toEqual({exitCode: 0});
    });

    it("should display help when --help is provided", async () => {
        // Arrange
        xImplMock.mockResolvedValue({exitCode: 99});

        // Act
        await main(["node", "x.mjs", "my-script", "--help"]);

        // Assert
        expect(outputHelpWithSplashMock).toHaveBeenCalledOnce();
    });

    it("should skip script execution when --help is provided", async () => {
        // Arrange
        xImplMock.mockResolvedValue({exitCode: 99});

        // Act
        await main(["node", "x.mjs", "my-script", "--help"]);

        // Assert
        expect(xImplMock).not.toHaveBeenCalled();
    });

    it("should return success when help is requested with -h", async () => {
        // Arrange
        xImplMock.mockResolvedValue({exitCode: 99});

        // Act
        const result = await main(["node", "x.mjs", "my-script", "-h"]);

        // Assert
        expect(result).toEqual({exitCode: 0});
    });

    it("should display help when -h is provided", async () => {
        // Arrange
        xImplMock.mockResolvedValue({exitCode: 99});

        // Act
        await main(["node", "x.mjs", "my-script", "-h"]);

        // Assert
        expect(outputHelpWithSplashMock).toHaveBeenCalledOnce();
    });

    it("should stop script execution when -h is provided", async () => {
        // Arrange
        xImplMock.mockResolvedValue({exitCode: 99});

        // Act
        await main(["node", "x.mjs", "my-script", "-h"]);

        // Assert
        expect(xImplMock).not.toHaveBeenCalled();
    });

    it("should return with exit code 1 when required input is missing", async () => {
        // Arrange
        outputHelpWithSplashMock.mockImplementation(() => {});

        // Act
        const result = await main(["node", "x.mjs"]);

        // Assert
        expect(result).toEqual({exitCode: 1});
    });

    it("should display help content when required input is missing", async () => {
        // Arrange
        outputHelpWithSplashMock.mockImplementation(() => {});

        // Act
        await main(["node", "x.mjs"]);

        // Assert
        expect(outputHelpWithSplashMock).toHaveBeenCalledTimes(1);
    });

    it("should include a validation message when required input is missing", async () => {
        // Arrange
        outputHelpWithSplashMock.mockImplementation(() => {});

        // Act
        await main(["node", "x.mjs"]);

        // Assert
        expect(outputHelpWithSplashMock.mock.calls[0]?.[1]).toBeTruthy();
    });

    it("should show the corrected command with positionals before -- in the tip", async () => {
        // Arrange
        xImplMock.mockResolvedValue({exitCode: 0});

        // Act
        await main(["node", "x.mjs", "e2e", "setup", "--flag", "value"]);

        // Assert
        expect(console.warn).toHaveBeenCalledWith(
            "  x e2e -- setup --flag value",
        );
    });

    it("should use names-only mode when --list is used without a value", async () => {
        // Arrange
        listImplMock.mockResolvedValue({exitCode: 0});

        // Act
        await main(["node", "x.mjs", "--list"]);

        // Assert
        expect(listImplMock).toHaveBeenCalledWith({
            mode: "names-only",
            json: false,
        });
    });

    it("should use full mode when --list=full is specified", async () => {
        // Arrange
        listImplMock.mockResolvedValue({exitCode: 0});

        // Act
        await main(["node", "x.mjs", "--list=full"]);

        // Assert
        expect(listImplMock).toHaveBeenCalledWith({
            mode: "full",
            json: false,
        });
    });

    it("should use JSON output format when --list and --json are used", async () => {
        // Arrange
        listImplMock.mockResolvedValue({exitCode: 0});

        // Act
        await main(["node", "x.mjs", "--list", "--json"]);

        // Assert
        expect(listImplMock).toHaveBeenCalledWith({
            mode: "names-only",
            json: true,
        });
    });

    it("should not execute a script when --list is provided", async () => {
        // Arrange
        listImplMock.mockResolvedValue({exitCode: 0});

        // Act
        await main(["node", "x.mjs", "--list"]);

        // Assert
        expect(xImplMock).not.toHaveBeenCalled();
    });

    it("should return the listing result exit code when --list is provided", async () => {
        // Arrange
        listImplMock.mockResolvedValue({exitCode: 0});

        // Act
        const result = await main(["node", "x.mjs", "--list"]);

        // Assert
        expect(result.exitCode).toBe(0);
    });

    it("should propagate unexpected errors thrown during listing", async () => {
        // Arrange
        const unexpectedError = new Error("Unexpected");
        listImplMock.mockRejectedValue(unexpectedError);

        // Assert
        await expect(main(["node", "x.mjs", "--list"])).rejects.toThrow(
            unexpectedError,
        );
    });

    it("should propagate HandledError thrown during listing", async () => {
        // Arrange
        const handledError = new HandledError("No packages found");
        listImplMock.mockRejectedValue(handledError);

        // Assert
        await expect(main(["node", "x.mjs", "--list"])).rejects.toThrow(
            handledError,
        );
    });
});
