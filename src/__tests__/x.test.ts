import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

// Utility to wait for all pending promises and timers to settle
const flushPromises = () =>
    new Promise<void>((resolve) => setTimeout(resolve, 0));

// Build a mock yargs chain that returns the given parsed args from parseSync
const buildYargsMock = (parsedArgs: Record<string, unknown>) => {
    const yargsChain: Record<string, unknown> = {
        usage: vi.fn().mockReturnThis(),
        option: vi.fn().mockReturnThis(),
        help: vi.fn().mockReturnThis(),
        alias: vi.fn().mockReturnThis(),
        version: vi.fn().mockReturnThis(),
        example: vi.fn().mockReturnThis(),
        strict: vi.fn().mockReturnThis(),
        parseSync: vi.fn().mockReturnValue(parsedArgs),
        // Needed when the command builder callback calls yargs.positional()
        positional: vi.fn().mockReturnThis(),
    };
    // Invoke the builder callback so its body is exercised
    yargsChain.command = vi
        .fn()
        .mockImplementation(
            (_name: unknown, _desc: unknown, builder: unknown) => {
                if (typeof builder === "function") {
                    builder(yargsChain);
                }
                return yargsChain;
            },
        );
    return {default: vi.fn().mockReturnValue(yargsChain)};
};

describe("bin/x", () => {
    let processExitSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        vi.resetModules();
        processExitSpy = vi
            .spyOn(process, "exit")
            .mockImplementation(() => undefined as never);
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should call xImpl with the script name from argv", async () => {
        // Arrange
        const xImplMock = vi.fn().mockResolvedValue({exitCode: 0});
        vi.doMock("../x-impl", () => ({xImpl: xImplMock}));
        vi.doMock("yargs", () =>
            buildYargsMock({
                "script-name": "my-script",
                _: [],
                "dry-run": false,
            }),
        );

        // Act
        await import("../bin/x");
        await flushPromises();

        // Assert
        expect(xImplMock).toHaveBeenCalledWith(
            "my-script",
            expect.any(Array),
            expect.any(Object),
        );
    });

    it("should call xImpl with args from argv underscore field", async () => {
        // Arrange
        const xImplMock = vi.fn().mockResolvedValue({exitCode: 0});
        vi.doMock("../x-impl", () => ({xImpl: xImplMock}));
        vi.doMock("yargs", () =>
            buildYargsMock({
                "script-name": "my-script",
                _: ["--flag", "value"],
                "dry-run": false,
            }),
        );

        // Act
        await import("../bin/x");
        await flushPromises();

        // Assert
        expect(xImplMock).toHaveBeenCalledWith(
            expect.any(String),
            ["--flag", "value"],
            expect.any(Object),
        );
    });

    it("should call xImpl with dryRun true when dry-run argv is true", async () => {
        // Arrange
        const xImplMock = vi.fn().mockResolvedValue({exitCode: 0});
        vi.doMock("../x-impl", () => ({xImpl: xImplMock}));
        vi.doMock("yargs", () =>
            buildYargsMock({
                "script-name": "my-script",
                _: [],
                "dry-run": true,
            }),
        );

        // Act
        await import("../bin/x");
        await flushPromises();

        // Assert
        expect(xImplMock).toHaveBeenCalledWith(
            expect.any(String),
            expect.any(Array),
            {dryRun: true},
        );
    });

    it("should call xImpl with dryRun false when dry-run argv is false", async () => {
        // Arrange
        const xImplMock = vi.fn().mockResolvedValue({exitCode: 0});
        vi.doMock("../x-impl", () => ({xImpl: xImplMock}));
        vi.doMock("yargs", () =>
            buildYargsMock({
                "script-name": "my-script",
                _: [],
                "dry-run": false,
            }),
        );

        // Act
        await import("../bin/x");
        await flushPromises();

        // Assert
        expect(xImplMock).toHaveBeenCalledWith(
            expect.any(String),
            expect.any(Array),
            {dryRun: false},
        );
    });

    it("should default to empty array when argv underscore field is falsy", async () => {
        // Arrange
        const xImplMock = vi.fn().mockResolvedValue({exitCode: 0});
        vi.doMock("../x-impl", () => ({xImpl: xImplMock}));
        vi.doMock("yargs", () =>
            buildYargsMock({
                "script-name": "my-script",
                _: null,
                "dry-run": false,
            }),
        );

        // Act
        await import("../bin/x");
        await flushPromises();

        // Assert
        expect(xImplMock).toHaveBeenCalledWith(
            expect.any(String),
            [],
            expect.any(Object),
        );
    });

    it("should exit with the exit code returned by xImpl", async () => {
        // Arrange
        vi.doMock("../x-impl", () => ({
            xImpl: vi.fn().mockResolvedValue({exitCode: 42}),
        }));
        vi.doMock("yargs", () =>
            buildYargsMock({
                "script-name": "my-script",
                _: [],
                "dry-run": false,
            }),
        );

        // Act
        await import("../bin/x");
        await flushPromises();

        // Assert
        expect(processExitSpy).toHaveBeenCalledWith(42);
    });

    it("should exit with 1 when xImpl throws an unexpected error", async () => {
        // Arrange
        vi.doMock("../x-impl", () => ({
            xImpl: vi.fn().mockRejectedValue(new Error("Unexpected")),
        }));
        vi.doMock("yargs", () =>
            buildYargsMock({
                "script-name": "my-script",
                _: [],
                "dry-run": false,
            }),
        );

        // Act
        await import("../bin/x");
        await flushPromises();

        // Assert
        expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it("should log error details when xImpl throws an unexpected error", async () => {
        // Arrange
        const unexpectedError = new Error("Something went wrong");
        vi.doMock("../x-impl", () => ({
            xImpl: vi.fn().mockRejectedValue(unexpectedError),
        }));
        vi.doMock("yargs", () =>
            buildYargsMock({
                "script-name": "my-script",
                _: [],
                "dry-run": false,
            }),
        );

        // Act
        await import("../bin/x");
        await flushPromises();

        // Assert
        expect(console.error).toHaveBeenCalledWith(
            "Unexpected error:",
            unexpectedError,
        );
    });
});
