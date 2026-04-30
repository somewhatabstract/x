import * as fs from "node:fs/promises";
import * as path from "node:path";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {buildEnvironment} from "../build-environment";

// Mock the fs module
vi.mock("node:fs/promises", () => ({
    readFile: vi.fn(),
}));

describe("buildEnvironment", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should pass through all existing environment variables so scripts see the full caller context", async () => {
        // Arrange
        const workspaceRoot = "/test/workspace";
        const currentEnv = {
            EXISTING_VAR: "existing-value",
            PATH: "/usr/bin:/bin",
        };
        vi.mocked(fs.readFile).mockResolvedValue(
            JSON.stringify({name: "test-workspace"}),
        );

        // Act
        const env = await buildEnvironment(workspaceRoot, currentEnv);

        // Assert
        expect(env.EXISTING_VAR).toBe("existing-value");
    });

    it("should make workspace executables available to scripts when the parent process has not already done so", async () => {
        // Arrange
        const workspaceRoot = "/test/workspace";
        const currentEnv = {PATH: "/usr/bin:/bin"};
        vi.mocked(fs.readFile).mockResolvedValue(
            JSON.stringify({name: "test-workspace"}),
        );

        // Act
        const env = await buildEnvironment(workspaceRoot, currentEnv);

        // Assert
        const expectedPath = path.join(workspaceRoot, "node_modules", ".bin");
        expect(env.PATH).toContain(expectedPath);
    });

    it("should not duplicate the workspace bin path when the parent process already added it", async () => {
        // Arrange
        const workspaceRoot = "/test/workspace";
        const workspaceBin = path.join(workspaceRoot, "node_modules", ".bin");
        const currentEnv = {PATH: `${workspaceBin}:/usr/bin`};
        vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify({}));

        // Act
        const env = await buildEnvironment(workspaceRoot, currentEnv);

        // Assert
        const entries = (env.PATH ?? "").split(path.delimiter);
        expect(entries.filter((e) => e === workspaceBin)).toHaveLength(1);
    });

    it("should signal to scripts that they are running under exec when no parent context exists", async () => {
        // Arrange
        const workspaceRoot = "/test/workspace";
        const currentEnv = {PATH: "/usr/bin"};
        vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify({}));

        // Act
        const env = await buildEnvironment(workspaceRoot, currentEnv);

        // Assert
        expect(env.npm_command).toBe("exec");
    });

    it("should defer to the parent process npm command context rather than overriding it", async () => {
        // Arrange
        const currentEnv = {PATH: "/usr/bin", npm_command: "run"};
        vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify({}));

        // Act
        const env = await buildEnvironment("/test/workspace", currentEnv);

        // Assert
        expect(env.npm_command).toBe("run");
    });

    it("should tell scripts where they were originally invoked from when no parent context exists", async () => {
        // Arrange
        const workspaceRoot = "/test/workspace";
        const currentEnv = {PATH: "/usr/bin"};
        const expectedCwd = process.cwd();
        vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify({}));

        // Act
        const env = await buildEnvironment(workspaceRoot, currentEnv);

        // Assert
        expect(env.INIT_CWD).toBe(expectedCwd);
    });

    it("should preserve the invocation directory established by the parent process", async () => {
        // Arrange
        const currentEnv = {PATH: "/usr/bin", INIT_CWD: "/some/project/subdir"};
        vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify({}));

        // Act
        const env = await buildEnvironment("/test/workspace", currentEnv);

        // Assert
        expect(env.INIT_CWD).toBe("/some/project/subdir");
    });

    it("should give scripts the path to the node executable so they can invoke node themselves", async () => {
        // Arrange
        const workspaceRoot = "/test/workspace";
        const currentEnv = {PATH: "/usr/bin"};
        vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify({}));

        // Act
        const env = await buildEnvironment(workspaceRoot, currentEnv);

        // Assert
        expect(env.npm_execpath).toBe(process.execPath);
    });

    it("should always identify as x in the user agent so external tools know what invoked the script", async () => {
        // Arrange
        const workspaceRoot = "/test/workspace";
        const currentEnv = {PATH: "/usr/bin"};
        vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify({}));

        // Act
        const env = await buildEnvironment(workspaceRoot, currentEnv);

        // Assert
        expect(env.npm_config_user_agent).toMatch(/^x\//);
    });

    it("should always include the node version in the user agent for compatibility identification", async () => {
        // Arrange
        const workspaceRoot = "/test/workspace";
        const currentEnv = {PATH: "/usr/bin"};
        vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify({}));

        // Act
        const env = await buildEnvironment(workspaceRoot, currentEnv);

        // Assert
        expect(env.npm_config_user_agent).toContain("node/");
    });

    it("should override a parent-provided user agent so scripts always see x as the invoking tool", async () => {
        // Arrange
        const currentEnv = {
            PATH: "/usr/bin",
            npm_config_user_agent: "pnpm/9.0.0 npm/? node/v20.0.0 darwin arm64",
        };
        vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify({}));

        // Act
        const env = await buildEnvironment("/test/workspace", currentEnv);

        // Assert
        expect(env.npm_config_user_agent).toMatch(/^x\//);
    });

    it("should expose the workspace package name to scripts when the parent process has not done so", async () => {
        // Arrange
        const workspaceRoot = "/test/workspace";
        const currentEnv = {PATH: "/usr/bin"};
        vi.mocked(fs.readFile).mockResolvedValue(
            JSON.stringify({name: "my-workspace", version: "2.5.0"}),
        );

        // Act
        const env = await buildEnvironment(workspaceRoot, currentEnv);

        // Assert
        expect(env.npm_package_name).toBe("my-workspace");
    });

    it("should expose the workspace package version to scripts when the parent process has not done so", async () => {
        // Arrange
        const workspaceRoot = "/test/workspace";
        const currentEnv = {PATH: "/usr/bin"};
        vi.mocked(fs.readFile).mockResolvedValue(
            JSON.stringify({name: "my-workspace", version: "2.5.0"}),
        );

        // Act
        const env = await buildEnvironment(workspaceRoot, currentEnv);

        // Assert
        expect(env.npm_package_version).toBe("2.5.0");
    });

    it("should expose the workspace package description to scripts when present", async () => {
        // Arrange
        const workspaceRoot = "/test/workspace";
        const currentEnv = {PATH: "/usr/bin"};
        vi.mocked(fs.readFile).mockResolvedValue(
            JSON.stringify({
                name: "my-workspace",
                description: "A test workspace",
            }),
        );

        // Act
        const env = await buildEnvironment(workspaceRoot, currentEnv);

        // Assert
        expect(env.npm_package_description).toBe("A test workspace");
    });

    it("should expose the workspace package license to scripts when present", async () => {
        // Arrange
        const workspaceRoot = "/test/workspace";
        const currentEnv = {PATH: "/usr/bin"};
        vi.mocked(fs.readFile).mockResolvedValue(
            JSON.stringify({name: "my-workspace", license: "MIT"}),
        );

        // Act
        const env = await buildEnvironment(workspaceRoot, currentEnv);

        // Assert
        expect(env.npm_package_license).toBe("MIT");
    });

    it("should expose the workspace package author to scripts when present", async () => {
        // Arrange
        const workspaceRoot = "/test/workspace";
        const currentEnv = {PATH: "/usr/bin"};
        vi.mocked(fs.readFile).mockResolvedValue(
            JSON.stringify({name: "my-workspace", author: "John Doe"}),
        );

        // Act
        const env = await buildEnvironment(workspaceRoot, currentEnv);

        // Assert
        expect(env.npm_package_author).toBe("John Doe");
    });

    it("should serialize complex package fields to JSON strings so they are usable as environment variable values", async () => {
        // Arrange
        const workspaceRoot = "/test/workspace";
        const currentEnv = {PATH: "/usr/bin"};
        const repository = {type: "git", url: "https://github.com/test/repo"};
        vi.mocked(fs.readFile).mockResolvedValue(
            JSON.stringify({name: "my-workspace", repository}),
        );

        // Act
        const env = await buildEnvironment(workspaceRoot, currentEnv);

        // Assert
        expect(env.npm_package_repository).toBe(JSON.stringify(repository));
    });

    it("should preserve package metadata set by the parent process rather than overwriting it from disk", async () => {
        // Arrange
        const currentEnv = {
            PATH: "/usr/bin",
            npm_package_name: "my-root-package",
        };
        vi.mocked(fs.readFile).mockResolvedValue(
            JSON.stringify({name: "should-not-appear"}),
        );

        // Act
        const env = await buildEnvironment("/test/workspace", currentEnv);

        // Assert
        expect(env.npm_package_name).toBe("my-root-package");
    });

    it("should still provide lifecycle variables even when the workspace package.json cannot be read", async () => {
        // Arrange
        const workspaceRoot = "/test/workspace";
        const currentEnv = {PATH: "/usr/bin"};
        vi.mocked(fs.readFile).mockRejectedValue(
            new Error("ENOENT: no such file"),
        );

        // Act
        const env = await buildEnvironment(workspaceRoot, currentEnv);

        // Assert
        expect(env.npm_command).toBe("exec");
    });

    it("should still expose the invocation directory even when the workspace package.json cannot be read", async () => {
        // Arrange
        const workspaceRoot = "/test/workspace";
        const currentEnv = {PATH: "/usr/bin"};
        vi.mocked(fs.readFile).mockRejectedValue(
            new Error("ENOENT: no such file"),
        );

        // Act
        const env = await buildEnvironment(workspaceRoot, currentEnv);

        // Assert
        expect(env.INIT_CWD).toBe(process.cwd());
    });
});
