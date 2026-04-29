import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {HandledError} from "../errors";

// Shared mutable state for the yargs mock - set per test before calling main()
const state = vi.hoisted(() => ({
    parsedArgs: {} as Record<string, unknown>,
}));

// vi.mock() calls are hoisted before static imports, so these mocks are in
// place when main() is imported below.
vi.mock("../x-impl", () => ({xImpl: vi.fn()}));
vi.mock("../list-impl", () => ({listImpl: vi.fn()}));
vi.mock("yargs", () => {
    // yargsCheckFn is registered when main() calls .check(fn) on the chain
    let yargsCheckFn: ((argv: Record<string, unknown>) => true) | undefined;

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
                yargsCheckFn = fn as (argv: Record<string, unknown>) => true;
            }
            return yargsChain;
        }),
        parseSync: vi.fn().mockImplementation(() => {
            if (yargsCheckFn) {
                try {
                    yargsCheckFn(state.parsedArgs);
                } catch (e) {
                    // Simulate yargs validation error: print message and exit
                    console.error((e as Error).message);
                    process.exit(1);
                    // Re-throw so that main() surfaces the error when process.exit
                    // is mocked to a no-op in tests, preventing subsequent code from
                    // running as if validation had passed.
                    throw e;
                }
            }
            return state.parsedArgs;
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
});

import {main} from "../bin/x";
import {listImpl} from "../list-impl";
import {xImpl} from "../x-impl";

describe("bin/x", () => {
    let processExitSpy: ReturnType<typeof vi.spyOn>;
    let originalArgv: string[];

    beforeEach(() => {
        vi.clearAllMocks();
        originalArgv = process.argv;
        processExitSpy = vi
            .spyOn(process, "exit")
            .mockImplementation(() => undefined as never);
        vi.spyOn(console, "error").mockImplementation(() => {});
        vi.spyOn(console, "warn").mockImplementation(() => {});
        // Default implementations — individual tests override as needed
        vi.mocked(xImpl).mockResolvedValue({exitCode: 0});
        vi.mocked(listImpl).mockResolvedValue({exitCode: 0});
    });

    afterEach(() => {
        process.argv = originalArgv;
        vi.restoreAllMocks();
    });

    it("should call xImpl with the script name from argv", async () => {
        // Arrange
        state.parsedArgs = {
            "script-name": "my-script",
            _: [],
            "dry-run": false,
        };

        // Act
        await main();

        // Assert
        expect(vi.mocked(xImpl)).toHaveBeenCalledWith(
            "my-script",
            expect.any(Array),
            expect.any(Object),
        );
        expect(console.warn).not.toHaveBeenCalled();
    });

    it("should call xImpl with args from argv underscore field", async () => {
        // Arrange
        state.parsedArgs = {
            "script-name": "my-script",
            _: ["--flag", "value"],
            "dry-run": false,
        };
        process.argv = ["node", "x.mjs", "my-script", "--", "--flag", "value"];

        // Act
        await main();

        // Assert
        expect(vi.mocked(xImpl)).toHaveBeenCalledWith(
            expect.any(String),
            ["--flag", "value"],
            expect.any(Object),
        );
        expect(console.warn).not.toHaveBeenCalled();
    });

    it("should call xImpl with dryRun true when dry-run argv is true", async () => {
        // Arrange
        state.parsedArgs = {
            "script-name": "my-script",
            _: [],
            "dry-run": true,
        };

        // Act
        await main();

        // Assert
        expect(vi.mocked(xImpl)).toHaveBeenCalledWith(
            expect.any(String),
            expect.any(Array),
            {dryRun: true},
        );
        expect(console.warn).not.toHaveBeenCalled();
    });

    it("should call xImpl with dryRun false when dry-run argv is false", async () => {
        // Arrange
        state.parsedArgs = {
            "script-name": "my-script",
            _: [],
            "dry-run": false,
        };

        // Act
        await main();

        // Assert
        expect(vi.mocked(xImpl)).toHaveBeenCalledWith(
            expect.any(String),
            expect.any(Array),
            {dryRun: false},
        );
        expect(console.warn).not.toHaveBeenCalled();
    });

    it("should default to empty array when argv underscore field is falsy", async () => {
        // Arrange
        state.parsedArgs = {
            "script-name": "my-script",
            _: null,
            "dry-run": false,
        };

        // Act
        await main();

        // Assert
        expect(vi.mocked(xImpl)).toHaveBeenCalledWith(
            expect.any(String),
            [],
            expect.any(Object),
        );
        expect(console.warn).not.toHaveBeenCalled();
    });

    it("should exit with the exit code returned by xImpl", async () => {
        // Arrange
        vi.mocked(xImpl).mockResolvedValue({exitCode: 42});
        state.parsedArgs = {
            "script-name": "my-script",
            _: [],
            "dry-run": false,
        };

        // Act
        await main();

        // Assert
        expect(processExitSpy).toHaveBeenCalledWith(42);
        expect(console.warn).not.toHaveBeenCalled();
    });

    it("should propagate unexpected errors thrown by xImpl", async () => {
        // Arrange
        const unexpectedError = new Error("Something went wrong");
        vi.mocked(xImpl).mockRejectedValue(unexpectedError);
        state.parsedArgs = {
            "script-name": "my-script",
            _: [],
            "dry-run": false,
        };

        // Assert
        await expect(main()).rejects.toThrow(unexpectedError);
    });

    it("should pass unknown flag args to xImpl when user omits --", async () => {
        // Arrange
        state.parsedArgs = {
            "script-name": "my-script",
            _: ["--unknown-flag", "value"],
            "dry-run": false,
        };
        process.argv = [
            "node",
            "x.mjs",
            "my-script",
            "--unknown-flag",
            "value",
        ];

        // Act
        await main();

        // Assert
        expect(vi.mocked(xImpl)).toHaveBeenCalledWith(
            "my-script",
            ["--unknown-flag", "value"],
            expect.any(Object),
        );
    });

    it("should show a tip when args contain flags and -- was not used", async () => {
        // Arrange
        state.parsedArgs = {
            "script-name": "my-script",
            _: ["--unknown-flag", "value"],
            "dry-run": false,
        };
        process.argv = [
            "node",
            "x.mjs",
            "my-script",
            "--unknown-flag",
            "value",
        ];

        // Act
        await main();

        // Assert
        expect(console.warn).toHaveBeenCalledWith(
            `Tip: To pass flags to "my-script", use '--' to separate them:`,
        );
    });

    it("should show the corrected command in the tip when args contain flags without --", async () => {
        // Arrange
        state.parsedArgs = {
            "script-name": "my-script",
            _: ["--unknown-flag", "value"],
            "dry-run": false,
        };
        process.argv = [
            "node",
            "x.mjs",
            "my-script",
            "--unknown-flag",
            "value",
        ];

        // Act
        await main();

        // Assert
        expect(console.warn).toHaveBeenCalledWith(
            "  x my-script -- --unknown-flag value",
        );
    });

    it("should not show a tip when -- was used before flag args", async () => {
        // Arrange
        state.parsedArgs = {
            "script-name": "my-script",
            _: ["--unknown-flag", "value"],
            "dry-run": false,
        };
        process.argv = [
            "node",
            "x.mjs",
            "my-script",
            "--",
            "--unknown-flag",
            "value",
        ];

        // Act
        await main();

        // Assert
        expect(console.warn).not.toHaveBeenCalled();
    });

    it("should not show a tip when args contain no flag-like values", async () => {
        // Arrange
        state.parsedArgs = {
            "script-name": "my-script",
            _: ["positional-arg", "another-arg"],
            "dry-run": false,
        };
        process.argv = [
            "node",
            "x.mjs",
            "my-script",
            "positional-arg",
            "another-arg",
        ];

        // Act
        await main();

        // Assert
        expect(console.warn).not.toHaveBeenCalled();
    });

    it("should pass positional args to xImpl when user omits --", async () => {
        // Arrange
        state.parsedArgs = {
            "script-name": "e2e",
            _: ["setup", "verify"],
            "dry-run": false,
        };
        process.argv = ["node", "x.mjs", "e2e", "setup", "verify"];

        // Act
        await main();

        // Assert
        expect(vi.mocked(xImpl)).toHaveBeenCalledWith(
            "e2e",
            ["setup", "verify"],
            expect.any(Object),
        );
        expect(console.warn).not.toHaveBeenCalled();
    });

    it("should show the corrected command with positionals before -- in the tip", async () => {
        // Arrange
        state.parsedArgs = {
            "script-name": "e2e",
            _: ["setup", "--flag", "value"],
            "dry-run": false,
        };
        process.argv = ["node", "x.mjs", "e2e", "setup", "--flag", "value"];

        // Act
        await main();

        // Assert
        expect(console.warn).toHaveBeenCalledWith(
            "  x e2e -- setup --flag value",
        );
    });

    it("should use names-only mode when --list is used without a value", async () => {
        // Arrange
        state.parsedArgs = {list: "", json: false, _: [], "dry-run": false};

        // Act
        await main();

        // Assert
        expect(vi.mocked(listImpl)).toHaveBeenCalledWith({
            mode: "names-only",
            json: false,
        });
    });

    it("should use names-only mode when --list=names-only is specified", async () => {
        // Arrange
        state.parsedArgs = {
            list: "names-only",
            json: false,
            _: [],
            "dry-run": false,
        };

        // Act
        await main();

        // Assert
        expect(vi.mocked(listImpl)).toHaveBeenCalledWith({
            mode: "names-only",
            json: false,
        });
    });

    it("should use full mode when --list=full is specified", async () => {
        // Arrange
        state.parsedArgs = {list: "full", json: false, _: [], "dry-run": false};

        // Act
        await main();

        // Assert
        expect(vi.mocked(listImpl)).toHaveBeenCalledWith({
            mode: "full",
            json: false,
        });
    });

    it("should use JSON output format when --list and --json are used", async () => {
        // Arrange
        state.parsedArgs = {list: "", json: true, _: [], "dry-run": false};

        // Act
        await main();

        // Assert
        expect(vi.mocked(listImpl)).toHaveBeenCalledWith({
            mode: "names-only",
            json: true,
        });
    });

    it("should not execute a script when --list is provided", async () => {
        // Arrange
        state.parsedArgs = {list: "", json: false, _: [], "dry-run": false};

        // Act
        await main();

        // Assert
        expect(vi.mocked(xImpl)).not.toHaveBeenCalled();
    });

    it("should exit with the listing result exit code when --list is provided", async () => {
        // Arrange
        state.parsedArgs = {list: "", json: false, _: [], "dry-run": false};

        // Act
        await main();

        // Assert
        expect(processExitSpy).toHaveBeenCalledWith(0);
    });

    it("should propagate unexpected errors thrown during listing", async () => {
        // Arrange
        const unexpectedError = new Error("Unexpected");
        vi.mocked(listImpl).mockRejectedValue(unexpectedError);
        state.parsedArgs = {list: "", json: false, _: [], "dry-run": false};

        // Assert
        await expect(main()).rejects.toThrow(unexpectedError);
    });

    it("should propagate HandledError thrown during listing", async () => {
        // Arrange
        const handledError = new HandledError("No packages found");
        vi.mocked(listImpl).mockRejectedValue(handledError);
        state.parsedArgs = {list: "", json: false, _: [], "dry-run": false};

        // Assert
        await expect(main()).rejects.toThrow(handledError);
    });

    it("should exit with 1 when no script name is provided", async () => {
        // Arrange
        state.parsedArgs = {
            "script-name": undefined,
            list: undefined,
            json: false,
            _: [],
            "dry-run": false,
        };

        // Act
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
        state.parsedArgs = {
            "script-name": undefined,
            list: undefined,
            json: false,
            _: [],
            "dry-run": false,
        };

        // Act
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
