import {describe, expect, it, vi, beforeEach} from "vitest";
import {buildEnvironment} from "../build-environment";
import * as fs from "node:fs/promises";
import * as path from "node:path";

// Mock the fs module
vi.mock("node:fs/promises", () => ({
    readFile: vi.fn(),
}));

describe("buildEnvironment", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should preserve existing environment variables", async () => {
        // Arrange
        const workspaceRoot = "/test/workspace";
        const currentEnv = {
            EXISTING_VAR: "existing-value",
            PATH: "/usr/bin:/bin",
        };

        vi.mocked(fs.readFile).mockResolvedValue(
            JSON.stringify({
                name: "test-workspace",
                version: "1.0.0",
            }),
        );

        // Act
        const env = await buildEnvironment(workspaceRoot, currentEnv);

        // Assert
        expect(env.EXISTING_VAR).toBe("existing-value");
    });

    it("should prepend workspace node_modules/.bin to PATH", async () => {
        // Arrange
        const workspaceRoot = "/test/workspace";
        const currentEnv = {
            PATH: "/usr/bin:/bin",
        };

        vi.mocked(fs.readFile).mockResolvedValue(
            JSON.stringify({
                name: "test-workspace",
            }),
        );

        // Act
        const env = await buildEnvironment(workspaceRoot, currentEnv);

        // Assert
        const expectedPath = path.join(workspaceRoot, "node_modules", ".bin");
        expect(env.PATH).toContain(expectedPath);
    });

    it("should set npm_command to exec", async () => {
        // Arrange
        const workspaceRoot = "/test/workspace";
        const currentEnv = {PATH: "/usr/bin"};

        vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify({}));

        // Act
        const env = await buildEnvironment(workspaceRoot, currentEnv);

        // Assert
        expect(env.npm_command).toBe("exec");
    });

    it("should set INIT_CWD to current working directory", async () => {
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

    it("should set npm_package_name from workspace package.json", async () => {
        // Arrange
        const workspaceRoot = "/test/workspace";
        const currentEnv = {PATH: "/usr/bin"};

        vi.mocked(fs.readFile).mockResolvedValue(
            JSON.stringify({
                name: "my-workspace",
                version: "2.5.0",
            }),
        );

        // Act
        const env = await buildEnvironment(workspaceRoot, currentEnv);

        // Assert
        expect(env.npm_package_name).toBe("my-workspace");
    });

    it("should set npm_package_version from workspace package.json", async () => {
        // Arrange
        const workspaceRoot = "/test/workspace";
        const currentEnv = {PATH: "/usr/bin"};

        vi.mocked(fs.readFile).mockResolvedValue(
            JSON.stringify({
                name: "my-workspace",
                version: "2.5.0",
            }),
        );

        // Act
        const env = await buildEnvironment(workspaceRoot, currentEnv);

        // Assert
        expect(env.npm_package_version).toBe("2.5.0");
    });

    it("should set npm_execpath to node executable path", async () => {
        // Arrange
        const workspaceRoot = "/test/workspace";
        const currentEnv = {PATH: "/usr/bin"};

        vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify({}));

        // Act
        const env = await buildEnvironment(workspaceRoot, currentEnv);

        // Assert
        expect(env.npm_execpath).toBe(process.execPath);
    });

    it("should set npm_config_user_agent", async () => {
        // Arrange
        const workspaceRoot = "/test/workspace";
        const currentEnv = {PATH: "/usr/bin"};

        vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify({}));

        // Act
        const env = await buildEnvironment(workspaceRoot, currentEnv);

        // Assert
        expect(env.npm_config_user_agent).toContain("x/");
        expect(env.npm_config_user_agent).toContain("node/");
    });

    it("should handle missing package.json gracefully", async () => {
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
        expect(env.INIT_CWD).toBe(process.cwd());
    });

    it("should include npm_package_description if present", async () => {
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

    it("should convert object fields to JSON strings", async () => {
        // Arrange
        const workspaceRoot = "/test/workspace";
        const currentEnv = {PATH: "/usr/bin"};

        vi.mocked(fs.readFile).mockResolvedValue(
            JSON.stringify({
                name: "my-workspace",
                repository: {
                    type: "git",
                    url: "https://github.com/test/repo",
                },
            }),
        );

        // Act
        const env = await buildEnvironment(workspaceRoot, currentEnv);

        // Assert
        expect(env.npm_package_repository).toBe(
            JSON.stringify({
                type: "git",
                url: "https://github.com/test/repo",
            }),
        );
    });
});
