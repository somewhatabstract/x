import {describe, expect, it, vi, beforeEach} from "vitest";
import {executeScript} from "../execute-script";
import type {BinInfo} from "../find-matching-bins";
import * as childProcess from "node:child_process";
import * as buildEnv from "../build-environment";

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
