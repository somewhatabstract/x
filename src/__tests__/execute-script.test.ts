import * as childProcess from "node:child_process";
import {beforeEach, describe, expect, it, vi} from "vitest";
import * as buildEnv from "../build-environment";
import {executeScript} from "../execute-script";
import type {BinInfo} from "../find-matching-bins";

// Mock child_process
vi.mock("node:child_process", () => ({
    spawn: vi.fn(),
}));

// Mock build-environment
vi.mock("../build-environment", () => ({
    buildEnvironment: vi.fn(),
}));

describe("executeScript", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should call buildEnvironment with workspace root and process.env", async () => {
        // Arrange
        const bin: BinInfo = {
            packageName: "test-package",
            packagePath: "/test/package",
            binName: "test-bin",
            binPath: "/test/package/bin/test",
        };
        const args = ["--arg1", "--arg2"];
        const workspaceRoot = "/test/workspace";

        const mockEnv = {TEST_VAR: "test"};
        vi.mocked(buildEnv.buildEnvironment).mockResolvedValue(mockEnv);

        const mockChild = {
            on: vi.fn((event, callback) => {
                if (event === "exit") {
                    // Immediately call exit with code 0
                    setTimeout(() => callback(0), 0);
                }
            }),
        };
        vi.mocked(childProcess.spawn).mockReturnValue(mockChild as any);

        // Act
        await executeScript(bin, args, workspaceRoot);

        // Assert
        expect(buildEnv.buildEnvironment).toHaveBeenCalledWith(
            workspaceRoot,
            process.env,
        );
    });

    it("should spawn process with bin path and args", async () => {
        // Arrange
        const bin: BinInfo = {
            packageName: "test-package",
            packagePath: "/test/package",
            binName: "test-bin",
            binPath: "/test/package/bin/test",
        };
        const args = ["--arg1", "--arg2"];
        const workspaceRoot = "/test/workspace";

        const mockEnv = {TEST_VAR: "test"};
        vi.mocked(buildEnv.buildEnvironment).mockResolvedValue(mockEnv);

        const mockChild = {
            on: vi.fn((event, callback) => {
                if (event === "exit") {
                    setTimeout(() => callback(0), 0);
                }
            }),
        };
        vi.mocked(childProcess.spawn).mockReturnValue(mockChild as any);

        // Act
        await executeScript(bin, args, workspaceRoot);

        // Assert
        expect(childProcess.spawn).toHaveBeenCalledWith(
            "/test/package/bin/test",
            ["--arg1", "--arg2"],
            expect.objectContaining({
                stdio: "inherit",
                env: mockEnv,
            }),
        );
    });

    it("should pass built environment to spawn", async () => {
        // Arrange
        const bin: BinInfo = {
            packageName: "test-package",
            packagePath: "/test/package",
            binName: "test-bin",
            binPath: "/test/package/bin/test",
        };
        const args: string[] = [];
        const workspaceRoot = "/test/workspace";

        const mockEnv = {
            TEST_VAR: "test",
            npm_package_name: "workspace",
        };
        vi.mocked(buildEnv.buildEnvironment).mockResolvedValue(mockEnv);

        const mockChild = {
            on: vi.fn((event, callback) => {
                if (event === "exit") {
                    setTimeout(() => callback(0), 0);
                }
            }),
        };
        vi.mocked(childProcess.spawn).mockReturnValue(mockChild as any);

        // Act
        await executeScript(bin, args, workspaceRoot);

        // Assert
        expect(childProcess.spawn).toHaveBeenCalledWith(
            expect.any(String),
            expect.any(Array),
            expect.objectContaining({
                env: mockEnv,
            }),
        );
    });

    it("should set stdio to inherit", async () => {
        // Arrange
        const bin: BinInfo = {
            packageName: "test-package",
            packagePath: "/test/package",
            binName: "test-bin",
            binPath: "/test/package/bin/test",
        };
        const args: string[] = [];
        const workspaceRoot = "/test/workspace";

        vi.mocked(buildEnv.buildEnvironment).mockResolvedValue({});

        const mockChild = {
            on: vi.fn((event, callback) => {
                if (event === "exit") {
                    setTimeout(() => callback(0), 0);
                }
            }),
        };
        vi.mocked(childProcess.spawn).mockReturnValue(mockChild as any);

        // Act
        await executeScript(bin, args, workspaceRoot);

        // Assert
        expect(childProcess.spawn).toHaveBeenCalledWith(
            expect.any(String),
            expect.any(Array),
            expect.objectContaining({
                stdio: "inherit",
            }),
        );
    });

    it("should return exit code 0 on successful execution", async () => {
        // Arrange
        const bin: BinInfo = {
            packageName: "test-package",
            packagePath: "/test/package",
            binName: "test-bin",
            binPath: "/test/package/bin/test",
        };
        const args: string[] = [];
        const workspaceRoot = "/test/workspace";

        vi.mocked(buildEnv.buildEnvironment).mockResolvedValue({});

        const mockChild = {
            on: vi.fn((event, callback) => {
                if (event === "exit") {
                    setTimeout(() => callback(0), 0);
                }
            }),
        };
        vi.mocked(childProcess.spawn).mockReturnValue(mockChild as any);

        // Act
        const exitCode = await executeScript(bin, args, workspaceRoot);

        // Assert
        expect(exitCode).toBe(0);
    });

    it("should return exit code from child process", async () => {
        // Arrange
        const bin: BinInfo = {
            packageName: "test-package",
            packagePath: "/test/package",
            binName: "test-bin",
            binPath: "/test/package/bin/test",
        };
        const args: string[] = [];
        const workspaceRoot = "/test/workspace";

        vi.mocked(buildEnv.buildEnvironment).mockResolvedValue({});

        const mockChild = {
            on: vi.fn((event, callback) => {
                if (event === "exit") {
                    setTimeout(() => callback(42), 0);
                }
            }),
        };
        vi.mocked(childProcess.spawn).mockReturnValue(mockChild as any);

        // Act
        const exitCode = await executeScript(bin, args, workspaceRoot);

        // Assert
        expect(exitCode).toBe(42);
    });

    it("should return 1 when exit code is null", async () => {
        // Arrange
        const bin: BinInfo = {
            packageName: "test-package",
            packagePath: "/test/package",
            binName: "test-bin",
            binPath: "/test/package/bin/test",
        };
        const args: string[] = [];
        const workspaceRoot = "/test/workspace";

        vi.mocked(buildEnv.buildEnvironment).mockResolvedValue({});

        const mockChild = {
            on: vi.fn((event, callback) => {
                if (event === "exit") {
                    setTimeout(() => callback(null), 0);
                }
            }),
        };
        vi.mocked(childProcess.spawn).mockReturnValue(mockChild as any);

        // Act
        const exitCode = await executeScript(bin, args, workspaceRoot);

        // Assert
        expect(exitCode).toBe(1);
    });

    it("should return 1 on spawn error (ENOENT)", async () => {
        // Arrange
        const bin: BinInfo = {
            packageName: "test-package",
            packagePath: "/test/package",
            binName: "test-bin",
            binPath: "/test/package/bin/nonexistent",
        };
        const args: string[] = [];
        const workspaceRoot = "/test/workspace";

        vi.mocked(buildEnv.buildEnvironment).mockResolvedValue({});

        const mockChild = {
            on: vi.fn((event, callback) => {
                if (event === "error") {
                    setTimeout(() => {
                        const error: any = new Error("ENOENT");
                        error.code = "ENOENT";
                        callback(error);
                    }, 0);
                }
            }),
        };
        vi.mocked(childProcess.spawn).mockReturnValue(mockChild as any);

        // Act
        const exitCode = await executeScript(bin, args, workspaceRoot);

        // Assert
        expect(exitCode).toBe(1);
    });

    it("should return 1 on spawn error (EACCES)", async () => {
        // Arrange
        const bin: BinInfo = {
            packageName: "test-package",
            packagePath: "/test/package",
            binName: "test-bin",
            binPath: "/test/package/bin/nopermission",
        };
        const args: string[] = [];
        const workspaceRoot = "/test/workspace";

        vi.mocked(buildEnv.buildEnvironment).mockResolvedValue({});

        const mockChild = {
            on: vi.fn((event, callback) => {
                if (event === "error") {
                    setTimeout(() => {
                        const error: any = new Error("EACCES");
                        error.code = "EACCES";
                        callback(error);
                    }, 0);
                }
            }),
        };
        vi.mocked(childProcess.spawn).mockReturnValue(mockChild as any);

        // Act
        const exitCode = await executeScript(bin, args, workspaceRoot);

        // Assert
        expect(exitCode).toBe(1);
    });

    it("should return 1 when process is killed by signal", async () => {
        // Arrange
        const bin: BinInfo = {
            packageName: "test-package",
            packagePath: "/test/package",
            binName: "test-bin",
            binPath: "/test/package/bin/test",
        };
        const args: string[] = [];
        const workspaceRoot = "/test/workspace";

        vi.mocked(buildEnv.buildEnvironment).mockResolvedValue({});

        const mockChild = {
            on: vi.fn((event, callback) => {
                if (event === "exit") {
                    // Simulate SIGTERM - exit with null code and signal
                    setTimeout(() => callback(null, "SIGTERM"), 0);
                }
            }),
        };
        vi.mocked(childProcess.spawn).mockReturnValue(mockChild as any);

        // Act
        const exitCode = await executeScript(bin, args, workspaceRoot);

        // Assert
        expect(exitCode).toBe(1);
    });

    it("should return 1 when process is killed by SIGINT", async () => {
        // Arrange
        const bin: BinInfo = {
            packageName: "test-package",
            packagePath: "/test/package",
            binName: "test-bin",
            binPath: "/test/package/bin/test",
        };
        const args: string[] = [];
        const workspaceRoot = "/test/workspace";

        vi.mocked(buildEnv.buildEnvironment).mockResolvedValue({});

        const mockChild = {
            on: vi.fn((event, callback) => {
                if (event === "exit") {
                    // Simulate SIGINT (Ctrl+C) - exit with null code and signal
                    setTimeout(() => callback(null, "SIGINT"), 0);
                }
            }),
        };
        vi.mocked(childProcess.spawn).mockReturnValue(mockChild as any);

        // Act
        const exitCode = await executeScript(bin, args, workspaceRoot);

        // Assert
        expect(exitCode).toBe(1);
    });
});

describe("executeScript - node-executable extensions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should invoke .js file via node with correct args passed through", async () => {
        // Arrange
        const bin: BinInfo = {
            packageName: "test-package",
            packagePath: "/test/package",
            binName: "test-bin",
            binPath: "/test/package/bin/test.js",
        };
        const args = ["--arg1", "--arg2"];
        const workspaceRoot = "/test/workspace";

        vi.mocked(buildEnv.buildEnvironment).mockResolvedValue({});

        const mockChild = {
            on: vi.fn((event, callback) => {
                if (event === "exit") {
                    setTimeout(() => callback(0), 0);
                }
            }),
        };
        vi.mocked(childProcess.spawn).mockReturnValue(mockChild as any);

        // Act
        await executeScript(bin, args, workspaceRoot);

        // Assert
        expect(childProcess.spawn).toHaveBeenCalledWith(
            process.execPath,
            ["/test/package/bin/test.js", "--arg1", "--arg2"],
            expect.objectContaining({stdio: "inherit"}),
        );
    });

    it("should invoke .mjs file via node with correct args passed through", async () => {
        // Arrange
        const bin: BinInfo = {
            packageName: "test-package",
            packagePath: "/test/package",
            binName: "test-bin",
            binPath: "/test/package/bin/test.mjs",
        };
        const args = ["--verbose"];
        const workspaceRoot = "/test/workspace";

        vi.mocked(buildEnv.buildEnvironment).mockResolvedValue({});

        const mockChild = {
            on: vi.fn((event, callback) => {
                if (event === "exit") {
                    setTimeout(() => callback(0), 0);
                }
            }),
        };
        vi.mocked(childProcess.spawn).mockReturnValue(mockChild as any);

        // Act
        await executeScript(bin, args, workspaceRoot);

        // Assert
        expect(childProcess.spawn).toHaveBeenCalledWith(
            process.execPath,
            ["/test/package/bin/test.mjs", "--verbose"],
            expect.objectContaining({stdio: "inherit"}),
        );
    });

    it("should invoke .cjs file via node with correct args passed through", async () => {
        // Arrange
        const bin: BinInfo = {
            packageName: "test-package",
            packagePath: "/test/package",
            binName: "test-bin",
            binPath: "/test/package/bin/test.cjs",
        };
        const args = ["input.txt"];
        const workspaceRoot = "/test/workspace";

        vi.mocked(buildEnv.buildEnvironment).mockResolvedValue({});

        const mockChild = {
            on: vi.fn((event, callback) => {
                if (event === "exit") {
                    setTimeout(() => callback(0), 0);
                }
            }),
        };
        vi.mocked(childProcess.spawn).mockReturnValue(mockChild as any);

        // Act
        await executeScript(bin, args, workspaceRoot);

        // Assert
        expect(childProcess.spawn).toHaveBeenCalledWith(
            process.execPath,
            ["/test/package/bin/test.cjs", "input.txt"],
            expect.objectContaining({stdio: "inherit"}),
        );
    });

    it("should invoke .JS file via node (case-insensitive detection)", async () => {
        // Arrange
        const bin: BinInfo = {
            packageName: "test-package",
            packagePath: "/test/package",
            binName: "test-bin",
            binPath: "/test/package/bin/test.JS",
        };

        vi.mocked(buildEnv.buildEnvironment).mockResolvedValue({});

        const mockChild = {
            on: vi.fn((event, callback) => {
                if (event === "exit") {
                    setTimeout(() => callback(0), 0);
                }
            }),
        };
        vi.mocked(childProcess.spawn).mockReturnValue(mockChild as any);

        // Act
        await executeScript(bin, [], "/test/workspace");

        // Assert: original casing preserved; node used as executable
        expect(childProcess.spawn).toHaveBeenCalledWith(
            process.execPath,
            ["/test/package/bin/test.JS"],
            expect.anything(),
        );
    });

    it("should invoke .Js file via node (case-insensitive detection)", async () => {
        // Arrange
        const bin: BinInfo = {
            packageName: "test-package",
            packagePath: "/test/package",
            binName: "test-bin",
            binPath: "/test/package/bin/test.Js",
        };

        vi.mocked(buildEnv.buildEnvironment).mockResolvedValue({});

        const mockChild = {
            on: vi.fn((event, callback) => {
                if (event === "exit") {
                    setTimeout(() => callback(0), 0);
                }
            }),
        };
        vi.mocked(childProcess.spawn).mockReturnValue(mockChild as any);

        // Act
        await executeScript(bin, [], "/test/workspace");

        // Assert
        expect(childProcess.spawn).toHaveBeenCalledWith(
            process.execPath,
            ["/test/package/bin/test.Js"],
            expect.anything(),
        );
    });

    it("should invoke .MJS file via node (case-insensitive detection)", async () => {
        // Arrange
        const bin: BinInfo = {
            packageName: "test-package",
            packagePath: "/test/package",
            binName: "test-bin",
            binPath: "/test/package/bin/test.MJS",
        };

        vi.mocked(buildEnv.buildEnvironment).mockResolvedValue({});

        const mockChild = {
            on: vi.fn((event, callback) => {
                if (event === "exit") {
                    setTimeout(() => callback(0), 0);
                }
            }),
        };
        vi.mocked(childProcess.spawn).mockReturnValue(mockChild as any);

        // Act
        await executeScript(bin, [], "/test/workspace");

        // Assert
        expect(childProcess.spawn).toHaveBeenCalledWith(
            process.execPath,
            ["/test/package/bin/test.MJS"],
            expect.anything(),
        );
    });

    it("should invoke .CJS file via node (case-insensitive detection)", async () => {
        // Arrange
        const bin: BinInfo = {
            packageName: "test-package",
            packagePath: "/test/package",
            binName: "test-bin",
            binPath: "/test/package/bin/test.CJS",
        };

        vi.mocked(buildEnv.buildEnvironment).mockResolvedValue({});

        const mockChild = {
            on: vi.fn((event, callback) => {
                if (event === "exit") {
                    setTimeout(() => callback(0), 0);
                }
            }),
        };
        vi.mocked(childProcess.spawn).mockReturnValue(mockChild as any);

        // Act
        await executeScript(bin, [], "/test/workspace");

        // Assert
        expect(childProcess.spawn).toHaveBeenCalledWith(
            process.execPath,
            ["/test/package/bin/test.CJS"],
            expect.anything(),
        );
    });

    it("should invoke .Mjs file via node (case-insensitive detection)", async () => {
        // Arrange
        const bin: BinInfo = {
            packageName: "test-package",
            packagePath: "/test/package",
            binName: "test-bin",
            binPath: "/test/package/bin/test.Mjs",
        };

        vi.mocked(buildEnv.buildEnvironment).mockResolvedValue({});

        const mockChild = {
            on: vi.fn((event, callback) => {
                if (event === "exit") {
                    setTimeout(() => callback(0), 0);
                }
            }),
        };
        vi.mocked(childProcess.spawn).mockReturnValue(mockChild as any);

        // Act
        await executeScript(bin, [], "/test/workspace");

        // Assert
        expect(childProcess.spawn).toHaveBeenCalledWith(
            process.execPath,
            ["/test/package/bin/test.Mjs"],
            expect.anything(),
        );
    });

    it("should invoke executable bash script directly (not via node)", async () => {
        // Arrange
        const bin: BinInfo = {
            packageName: "test-package",
            packagePath: "/test/package",
            binName: "test-bin",
            binPath: "/test/package/bin/test.sh",
        };
        const args = ["--flag"];

        vi.mocked(buildEnv.buildEnvironment).mockResolvedValue({});

        const mockChild = {
            on: vi.fn((event, callback) => {
                if (event === "exit") {
                    setTimeout(() => callback(0), 0);
                }
            }),
        };
        vi.mocked(childProcess.spawn).mockReturnValue(mockChild as any);

        // Act
        await executeScript(bin, args, "/test/workspace");

        // Assert: invoked directly, not via node
        expect(childProcess.spawn).toHaveBeenCalledWith(
            "/test/package/bin/test.sh",
            ["--flag"],
            expect.objectContaining({stdio: "inherit"}),
        );
    });

    it("should invoke non-executable bash script directly (will error at OS level)", async () => {
        // Arrange - a .sh without executable bit; OS will raise EACCES
        const bin: BinInfo = {
            packageName: "test-package",
            packagePath: "/test/package",
            binName: "test-bin",
            binPath: "/test/package/bin/noperm.sh",
        };

        vi.mocked(buildEnv.buildEnvironment).mockResolvedValue({});

        const mockChild = {
            on: vi.fn((event, callback) => {
                if (event === "error") {
                    setTimeout(() => {
                        const error: any = new Error("EACCES");
                        error.code = "EACCES";
                        callback(error);
                    }, 0);
                }
            }),
        };
        vi.mocked(childProcess.spawn).mockReturnValue(mockChild as any);

        // Act
        await executeScript(bin, [], "/test/workspace");

        // Assert: invoked directly, not via node
        expect(childProcess.spawn).toHaveBeenCalledWith(
            "/test/package/bin/noperm.sh",
            [],
            expect.anything(),
        );
    });

    it("should return 1 when non-executable bash script errors", async () => {
        // Arrange
        const bin: BinInfo = {
            packageName: "test-package",
            packagePath: "/test/package",
            binName: "test-bin",
            binPath: "/test/package/bin/noperm.sh",
        };

        vi.mocked(buildEnv.buildEnvironment).mockResolvedValue({});

        const mockChild = {
            on: vi.fn((event, callback) => {
                if (event === "error") {
                    setTimeout(() => {
                        const error: any = new Error("EACCES");
                        error.code = "EACCES";
                        callback(error);
                    }, 0);
                }
            }),
        };
        vi.mocked(childProcess.spawn).mockReturnValue(mockChild as any);

        // Act
        const exitCode = await executeScript(bin, [], "/test/workspace");

        // Assert
        expect(exitCode).toBe(1);
    });

    it("should invoke file with no extension directly", async () => {
        // Arrange
        const bin: BinInfo = {
            packageName: "test-package",
            packagePath: "/test/package",
            binName: "test-bin",
            binPath: "/test/package/bin/mycli",
        };

        vi.mocked(buildEnv.buildEnvironment).mockResolvedValue({});

        const mockChild = {
            on: vi.fn((event, callback) => {
                if (event === "exit") {
                    setTimeout(() => callback(0), 0);
                }
            }),
        };
        vi.mocked(childProcess.spawn).mockReturnValue(mockChild as any);

        // Act
        await executeScript(bin, [], "/test/workspace");

        // Assert
        expect(childProcess.spawn).toHaveBeenCalledWith(
            "/test/package/bin/mycli",
            [],
            expect.anything(),
        );
    });

    it("should invoke file with .js.bak extension directly (not via node)", async () => {
        // Arrange - .js is in the middle, not the final extension
        const bin: BinInfo = {
            packageName: "test-package",
            packagePath: "/test/package",
            binName: "test-bin",
            binPath: "/test/package/bin/script.js.bak",
        };

        vi.mocked(buildEnv.buildEnvironment).mockResolvedValue({});

        const mockChild = {
            on: vi.fn((event, callback) => {
                if (event === "exit") {
                    setTimeout(() => callback(0), 0);
                }
            }),
        };
        vi.mocked(childProcess.spawn).mockReturnValue(mockChild as any);

        // Act
        await executeScript(bin, [], "/test/workspace");

        // Assert: .js.bak is not a node-executable extension
        expect(childProcess.spawn).toHaveBeenCalledWith(
            "/test/package/bin/script.js.bak",
            [],
            expect.anything(),
        );
    });

    it("should pass environment variables to node-invoked scripts", async () => {
        // Arrange
        const bin: BinInfo = {
            packageName: "test-package",
            packagePath: "/test/package",
            binName: "test-bin",
            binPath: "/test/package/bin/test.js",
        };
        const mockEnv = {MY_VAR: "my-value", npm_package_name: "workspace"};

        vi.mocked(buildEnv.buildEnvironment).mockResolvedValue(mockEnv);

        const mockChild = {
            on: vi.fn((event, callback) => {
                if (event === "exit") {
                    setTimeout(() => callback(0), 0);
                }
            }),
        };
        vi.mocked(childProcess.spawn).mockReturnValue(mockChild as any);

        // Act
        await executeScript(bin, [], "/test/workspace");

        // Assert
        expect(childProcess.spawn).toHaveBeenCalledWith(
            process.execPath,
            expect.any(Array),
            expect.objectContaining({env: mockEnv}),
        );
    });

    it("should inherit stdio for node-invoked scripts", async () => {
        // Arrange
        const bin: BinInfo = {
            packageName: "test-package",
            packagePath: "/test/package",
            binName: "test-bin",
            binPath: "/test/package/bin/test.mjs",
        };

        vi.mocked(buildEnv.buildEnvironment).mockResolvedValue({});

        const mockChild = {
            on: vi.fn((event, callback) => {
                if (event === "exit") {
                    setTimeout(() => callback(0), 0);
                }
            }),
        };
        vi.mocked(childProcess.spawn).mockReturnValue(mockChild as any);

        // Act
        await executeScript(bin, [], "/test/workspace");

        // Assert
        expect(childProcess.spawn).toHaveBeenCalledWith(
            process.execPath,
            expect.any(Array),
            expect.objectContaining({stdio: "inherit"}),
        );
    });

    it("should pass exit code through from node-invoked scripts", async () => {
        // Arrange
        const bin: BinInfo = {
            packageName: "test-package",
            packagePath: "/test/package",
            binName: "test-bin",
            binPath: "/test/package/bin/test.js",
        };

        vi.mocked(buildEnv.buildEnvironment).mockResolvedValue({});

        const mockChild = {
            on: vi.fn((event, callback) => {
                if (event === "exit") {
                    setTimeout(() => callback(42), 0);
                }
            }),
        };
        vi.mocked(childProcess.spawn).mockReturnValue(mockChild as any);

        // Act
        const exitCode = await executeScript(bin, [], "/test/workspace");

        // Assert
        expect(exitCode).toBe(42);
    });

    it("should return 1 on spawn error (ENOENT) for node-invoked scripts", async () => {
        // Arrange
        const bin: BinInfo = {
            packageName: "test-package",
            packagePath: "/test/package",
            binName: "test-bin",
            binPath: "/test/package/bin/missing.js",
        };

        vi.mocked(buildEnv.buildEnvironment).mockResolvedValue({});

        const mockChild = {
            on: vi.fn((event, callback) => {
                if (event === "error") {
                    setTimeout(() => {
                        const error: any = new Error("ENOENT");
                        error.code = "ENOENT";
                        callback(error);
                    }, 0);
                }
            }),
        };
        vi.mocked(childProcess.spawn).mockReturnValue(mockChild as any);

        // Act
        const exitCode = await executeScript(bin, [], "/test/workspace");

        // Assert
        expect(exitCode).toBe(1);
    });

    it("should return 1 when node-invoked script is killed by SIGTERM", async () => {
        // Arrange
        const bin: BinInfo = {
            packageName: "test-package",
            packagePath: "/test/package",
            binName: "test-bin",
            binPath: "/test/package/bin/test.js",
        };

        vi.mocked(buildEnv.buildEnvironment).mockResolvedValue({});

        const mockChild = {
            on: vi.fn((event, callback) => {
                if (event === "exit") {
                    setTimeout(() => callback(null, "SIGTERM"), 0);
                }
            }),
        };
        vi.mocked(childProcess.spawn).mockReturnValue(mockChild as any);

        // Act
        const exitCode = await executeScript(bin, [], "/test/workspace");

        // Assert
        expect(exitCode).toBe(1);
    });

    it("should return 1 when node-invoked script is killed by SIGINT", async () => {
        // Arrange
        const bin: BinInfo = {
            packageName: "test-package",
            packagePath: "/test/package",
            binName: "test-bin",
            binPath: "/test/package/bin/test.mjs",
        };

        vi.mocked(buildEnv.buildEnvironment).mockResolvedValue({});

        const mockChild = {
            on: vi.fn((event, callback) => {
                if (event === "exit") {
                    setTimeout(() => callback(null, "SIGINT"), 0);
                }
            }),
        };
        vi.mocked(childProcess.spawn).mockReturnValue(mockChild as any);

        // Act
        const exitCode = await executeScript(bin, [], "/test/workspace");

        // Assert
        expect(exitCode).toBe(1);
    });

    it("should preserve arguments with spaces for node-invoked scripts", async () => {
        // Arrange
        const bin: BinInfo = {
            packageName: "test-package",
            packagePath: "/test/package",
            binName: "test-bin",
            binPath: "/test/package/bin/test.js",
        };
        const args = ["file with spaces.txt", "--message=hello world"];

        vi.mocked(buildEnv.buildEnvironment).mockResolvedValue({});

        const mockChild = {
            on: vi.fn((event, callback) => {
                if (event === "exit") {
                    setTimeout(() => callback(0), 0);
                }
            }),
        };
        vi.mocked(childProcess.spawn).mockReturnValue(mockChild as any);

        // Act
        await executeScript(bin, args, "/test/workspace");

        // Assert
        expect(childProcess.spawn).toHaveBeenCalledWith(
            process.execPath,
            [
                "/test/package/bin/test.js",
                "file with spaces.txt",
                "--message=hello world",
            ],
            expect.anything(),
        );
    });

    it("should pass multiple arguments correctly to node-invoked scripts", async () => {
        // Arrange
        const bin: BinInfo = {
            packageName: "test-package",
            packagePath: "/test/package",
            binName: "test-bin",
            binPath: "/test/package/bin/test.cjs",
        };
        const args = ["--a", "--b", "--c", "value"];

        vi.mocked(buildEnv.buildEnvironment).mockResolvedValue({});

        const mockChild = {
            on: vi.fn((event, callback) => {
                if (event === "exit") {
                    setTimeout(() => callback(0), 0);
                }
            }),
        };
        vi.mocked(childProcess.spawn).mockReturnValue(mockChild as any);

        // Act
        await executeScript(bin, args, "/test/workspace");

        // Assert
        expect(childProcess.spawn).toHaveBeenCalledWith(
            process.execPath,
            ["/test/package/bin/test.cjs", "--a", "--b", "--c", "value"],
            expect.anything(),
        );
    });
});
