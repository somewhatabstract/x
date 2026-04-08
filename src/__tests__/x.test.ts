import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

// Build a mock yargs chain that returns the given parsed args from parseSync
const buildYargsMock = (parsedArgs: Record<string, unknown>) => {
    let checkFn: ((argv: Record<string, unknown>) => true) | undefined;

    const yargsChain: Record<string, unknown> = {
        usage: vi.fn().mockReturnThis(),
        option: vi.fn().mockReturnThis(),
        help: vi.fn().mockReturnThis(),
        alias: vi.fn().mockReturnThis(),
        version: vi.fn().mockReturnThis(),
        example: vi.fn().mockReturnThis(),
        parserConfiguration: vi.fn().mockReturnThis(),
        // Needed when the command builder callback calls yargs.positional()
        positional: vi.fn().mockReturnThis(),
        check: vi.fn().mockImplementation((fn: unknown) => {
            if (typeof fn === "function") {
                checkFn = fn as (argv: Record<string, unknown>) => true;
            }
            return yargsChain;
        }),
        parseSync: vi.fn().mockImplementation(() => {
            if (checkFn) {
                try {
                    checkFn(parsedArgs);
                } catch (e) {
                    // Simulate yargs validation error: print message and exit
                    console.error((e as Error).message);
                    process.exit(1);
                    // Re-throw to prevent further execution when process.exit is mocked
                    throw e;
                }
            }
            return parsedArgs;
        }),
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
    let originalArgv: string[];

    beforeEach(() => {
        vi.resetModules();
        originalArgv = process.argv;
        processExitSpy = vi
            .spyOn(process, "exit")
            .mockImplementation(() => undefined as never);
        vi.spyOn(console, "error").mockImplementation(() => {});
        vi.spyOn(console, "warn").mockImplementation(() => {});
    });

    afterEach(() => {
        process.argv = originalArgv;
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
        const {main} = await import("../bin/x");
        await main();

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
        const xImplMock = vi.fn().mockResolvedValue({exitCode: 0});
        vi.doMock("../x-impl", () => ({xImpl: xImplMock}));
        vi.doMock("yargs", () =>
            buildYargsMock({
                "script-name": "my-script",
                _: ["--flag", "value"],
                "dry-run": false,
            }),
        );
        process.argv = ["node", "x.mjs", "my-script", "--", "--flag", "value"];

        // Act
        const {main} = await import("../bin/x");
        await main();

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
        const {main} = await import("../bin/x");
        await main();

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
        const {main} = await import("../bin/x");
        await main();

        // Assert
        expect(xImplMock).toHaveBeenCalledWith(
            expect.any(String),
            expect.any(Array),
            {dryRun: false},
        );
        expect(console.warn).not.toHaveBeenCalled();
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
        const {main} = await import("../bin/x");
        await main();

        // Assert
        expect(xImplMock).toHaveBeenCalledWith(
            expect.any(String),
            [],
            expect.any(Object),
        );
        expect(console.warn).not.toHaveBeenCalled();
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
        const {main} = await import("../bin/x");
        await main();

        // Assert
        expect(processExitSpy).toHaveBeenCalledWith(42);
        expect(console.warn).not.toHaveBeenCalled();
    });

    it("should propagate unexpected errors thrown by xImpl", async () => {
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
        const {main} = await import("../bin/x");

        // Assert
        await expect(main()).rejects.toThrow(unexpectedError);
    });

    it("should pass unknown flag args to xImpl when user omits --", async () => {
        // Arrange
        const xImplMock = vi.fn().mockResolvedValue({exitCode: 0});
        vi.doMock("../x-impl", () => ({xImpl: xImplMock}));
        vi.doMock("yargs", () =>
            buildYargsMock({
                "script-name": "my-script",
                _: ["--unknown-flag", "value"],
                "dry-run": false,
            }),
        );
        process.argv = [
            "node",
            "x.mjs",
            "my-script",
            "--unknown-flag",
            "value",
        ];

        // Act
        const {main} = await import("../bin/x");
        await main();

        // Assert
        expect(xImplMock).toHaveBeenCalledWith(
            "my-script",
            ["--unknown-flag", "value"],
            expect.any(Object),
        );
    });

    it("should show a tip when args contain flags and -- was not used", async () => {
        // Arrange
        vi.doMock("../x-impl", () => ({
            xImpl: vi.fn().mockResolvedValue({exitCode: 0}),
        }));
        vi.doMock("yargs", () =>
            buildYargsMock({
                "script-name": "my-script",
                _: ["--unknown-flag", "value"],
                "dry-run": false,
            }),
        );
        process.argv = [
            "node",
            "x.mjs",
            "my-script",
            "--unknown-flag",
            "value",
        ];

        // Act
        const {main} = await import("../bin/x");
        await main();

        // Assert
        expect(console.warn).toHaveBeenCalledWith(
            `Tip: To pass flags to "my-script", use '--' to separate them:`,
        );
    });

    it("should show the corrected command in the tip when args contain flags without --", async () => {
        // Arrange
        vi.doMock("../x-impl", () => ({
            xImpl: vi.fn().mockResolvedValue({exitCode: 0}),
        }));
        vi.doMock("yargs", () =>
            buildYargsMock({
                "script-name": "my-script",
                _: ["--unknown-flag", "value"],
                "dry-run": false,
            }),
        );
        process.argv = [
            "node",
            "x.mjs",
            "my-script",
            "--unknown-flag",
            "value",
        ];

        // Act
        const {main} = await import("../bin/x");
        await main();

        // Assert
        expect(console.warn).toHaveBeenCalledWith(
            "  x my-script -- --unknown-flag value",
        );
    });

    it("should not show a tip when -- was used before flag args", async () => {
        // Arrange
        vi.doMock("../x-impl", () => ({
            xImpl: vi.fn().mockResolvedValue({exitCode: 0}),
        }));
        vi.doMock("yargs", () =>
            buildYargsMock({
                "script-name": "my-script",
                _: ["--unknown-flag", "value"],
                "dry-run": false,
            }),
        );
        process.argv = [
            "node",
            "x.mjs",
            "my-script",
            "--",
            "--unknown-flag",
            "value",
        ];

        // Act
        const {main} = await import("../bin/x");
        await main();

        // Assert
        expect(console.warn).not.toHaveBeenCalled();
    });

    it("should not show a tip when args contain no flag-like values", async () => {
        // Arrange
        vi.doMock("../x-impl", () => ({
            xImpl: vi.fn().mockResolvedValue({exitCode: 0}),
        }));
        vi.doMock("yargs", () =>
            buildYargsMock({
                "script-name": "my-script",
                _: ["positional-arg", "another-arg"],
                "dry-run": false,
            }),
        );
        process.argv = [
            "node",
            "x.mjs",
            "my-script",
            "positional-arg",
            "another-arg",
        ];

        // Act
        const {main} = await import("../bin/x");
        await main();

        // Assert
        expect(console.warn).not.toHaveBeenCalled();
    });

    it("should pass positional args to xImpl when user omits --", async () => {
        // Arrange
        const xImplMock = vi.fn().mockResolvedValue({exitCode: 0});
        vi.doMock("../x-impl", () => ({xImpl: xImplMock}));
        vi.doMock("yargs", () =>
            buildYargsMock({
                "script-name": "e2e",
                _: ["setup", "verify"],
                "dry-run": false,
            }),
        );
        process.argv = ["node", "x.mjs", "e2e", "setup", "verify"];

        // Act
        const {main} = await import("../bin/x");
        await main();

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
        vi.doMock("../x-impl", () => ({
            xImpl: vi.fn().mockResolvedValue({exitCode: 0}),
        }));
        vi.doMock("yargs", () =>
            buildYargsMock({
                "script-name": "e2e",
                _: ["setup", "--flag", "value"],
                "dry-run": false,
            }),
        );
        process.argv = ["node", "x.mjs", "e2e", "setup", "--flag", "value"];

        // Act
        const {main} = await import("../bin/x");
        await main();

        // Assert
        expect(console.warn).toHaveBeenCalledWith(
            "  x e2e -- setup --flag value",
        );
    });

    it("should use names-only mode when --list is used without a value", async () => {
        // Arrange
        const listImplMock = vi.fn().mockResolvedValue({exitCode: 0});
        vi.doMock("../list-impl", () => ({listImpl: listImplMock}));
        vi.doMock("../x-impl", () => ({
            xImpl: vi.fn().mockResolvedValue({exitCode: 0}),
        }));
        vi.doMock("yargs", () =>
            buildYargsMock({
                list: "",
                json: false,
                _: [],
                "dry-run": false,
            }),
        );

        // Act
        const {main} = await import("../bin/x");
        await main();

        // Assert
        expect(listImplMock).toHaveBeenCalledWith({
            mode: "names-only",
            json: false,
        });
    });

    it("should use names-only mode when --list=names-only is specified", async () => {
        // Arrange
        const listImplMock = vi.fn().mockResolvedValue({exitCode: 0});
        vi.doMock("../list-impl", () => ({listImpl: listImplMock}));
        vi.doMock("../x-impl", () => ({
            xImpl: vi.fn().mockResolvedValue({exitCode: 0}),
        }));
        vi.doMock("yargs", () =>
            buildYargsMock({
                list: "names-only",
                json: false,
                _: [],
                "dry-run": false,
            }),
        );

        // Act
        const {main} = await import("../bin/x");
        await main();

        // Assert
        expect(listImplMock).toHaveBeenCalledWith({
            mode: "names-only",
            json: false,
        });
    });

    it("should use full mode when --list=full is specified", async () => {
        // Arrange
        const listImplMock = vi.fn().mockResolvedValue({exitCode: 0});
        vi.doMock("../list-impl", () => ({listImpl: listImplMock}));
        vi.doMock("../x-impl", () => ({
            xImpl: vi.fn().mockResolvedValue({exitCode: 0}),
        }));
        vi.doMock("yargs", () =>
            buildYargsMock({
                list: "full",
                json: false,
                _: [],
                "dry-run": false,
            }),
        );

        // Act
        const {main} = await import("../bin/x");
        await main();

        // Assert
        expect(listImplMock).toHaveBeenCalledWith({
            mode: "full",
            json: false,
        });
    });

    it("should use JSON output format when --list and --json are used", async () => {
        // Arrange
        const listImplMock = vi.fn().mockResolvedValue({exitCode: 0});
        vi.doMock("../list-impl", () => ({listImpl: listImplMock}));
        vi.doMock("../x-impl", () => ({
            xImpl: vi.fn().mockResolvedValue({exitCode: 0}),
        }));
        vi.doMock("yargs", () =>
            buildYargsMock({
                list: "",
                json: true,
                _: [],
                "dry-run": false,
            }),
        );

        // Act
        const {main} = await import("../bin/x");
        await main();

        // Assert
        expect(listImplMock).toHaveBeenCalledWith({
            mode: "names-only",
            json: true,
        });
    });

    it("should not execute a script when --list is provided", async () => {
        // Arrange
        const xImplMock = vi.fn().mockResolvedValue({exitCode: 0});
        vi.doMock("../list-impl", () => ({
            listImpl: vi.fn().mockResolvedValue({exitCode: 0}),
        }));
        vi.doMock("../x-impl", () => ({xImpl: xImplMock}));
        vi.doMock("yargs", () =>
            buildYargsMock({
                list: "",
                json: false,
                _: [],
                "dry-run": false,
            }),
        );

        // Act
        const {main} = await import("../bin/x");
        await main();

        // Assert
        expect(xImplMock).not.toHaveBeenCalled();
    });

    it("should exit with the listing result exit code when --list is provided", async () => {
        // Arrange
        vi.doMock("../list-impl", () => ({
            listImpl: vi.fn().mockResolvedValue({exitCode: 0}),
        }));
        vi.doMock("../x-impl", () => ({
            xImpl: vi.fn().mockResolvedValue({exitCode: 0}),
        }));
        vi.doMock("yargs", () =>
            buildYargsMock({
                list: "",
                json: false,
                _: [],
                "dry-run": false,
            }),
        );

        // Act
        const {main} = await import("../bin/x");
        await main();

        // Assert
        expect(processExitSpy).toHaveBeenCalledWith(0);
    });

    it("should propagate unexpected errors thrown during listing", async () => {
        // Arrange
        const unexpectedError = new Error("Unexpected");
        vi.doMock("../list-impl", () => ({
            listImpl: vi.fn().mockRejectedValue(unexpectedError),
        }));
        vi.doMock("../x-impl", () => ({
            xImpl: vi.fn().mockResolvedValue({exitCode: 0}),
        }));
        vi.doMock("yargs", () =>
            buildYargsMock({
                list: "",
                json: false,
                _: [],
                "dry-run": false,
            }),
        );

        // Act
        const {main} = await import("../bin/x");

        // Assert
        await expect(main()).rejects.toThrow(unexpectedError);
    });

    it("should exit with 1 when no script name is provided", async () => {
        // Arrange
        vi.doMock("../x-impl", () => ({
            xImpl: vi.fn().mockResolvedValue({exitCode: 0}),
        }));
        vi.doMock("yargs", () =>
            buildYargsMock({
                "script-name": undefined,
                list: undefined,
                json: false,
                _: [],
                "dry-run": false,
            }),
        );

        // Act
        const {main} = await import("../bin/x");
        try {
            await main();
        } catch {
            // expected — validation error thrown by the yargs check mock
        }

        // Assert
        expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it("should report an error when no script name is provided", async () => {
        // Arrange
        vi.doMock("../x-impl", () => ({
            xImpl: vi.fn().mockResolvedValue({exitCode: 0}),
        }));
        vi.doMock("yargs", () =>
            buildYargsMock({
                "script-name": undefined,
                list: undefined,
                json: false,
                _: [],
                "dry-run": false,
            }),
        );

        // Act
        const {main} = await import("../bin/x");
        try {
            await main();
        } catch {
            // expected — validation error thrown by the yargs check mock
        }

        // Assert
        expect(console.error).toHaveBeenCalledWith(
            expect.stringContaining("script-name is required"),
        );
    });
});
