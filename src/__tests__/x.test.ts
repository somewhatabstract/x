import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {main} from "../bin/x";
import {xImpl} from "../x-impl";

vi.mock("../x-impl", () => ({
    xImpl: vi.fn(),
}));

describe("bin/x", () => {
    const xImplMock = vi.mocked(xImpl);

    beforeEach(() => {
        xImplMock.mockReset();
        vi.spyOn(console, "error").mockImplementation(() => {});
        vi.spyOn(console, "warn").mockImplementation(() => {});
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
});
