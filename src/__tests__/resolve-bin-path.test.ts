import path from "node:path";
import {describe, expect, it} from "vitest";
import type {PackageInfo} from "../discover-packages";
import {resolveBinPath} from "../resolve-bin-path";

describe("resolveBinPath", () => {
    const mockPackage: PackageInfo = {
        name: "test-package",
        path: "/workspace/packages/test-package",
        version: "1.0.0",
    };

    describe("basic functionality", () => {
        it("should resolve string-style bin when binName matches package name", () => {
            // Arrange
            const bin = "bin/cli.js";
            const binName = "test-package";

            // Act
            const result = resolveBinPath(mockPackage, bin, binName);

            // Assert
            expect(result).toBe(
                path.resolve("/workspace/packages/test-package", "bin/cli.js"),
            );
        });

        it("should return null for string-style bin when binName doesn't match package name", () => {
            // Arrange
            const bin = "bin/cli.js";
            const binName = "different-name";

            // Act
            const result = resolveBinPath(mockPackage, bin, binName);

            // Assert
            expect(result).toBeNull();
        });

        it("should resolve object-style bin when binName exists in bin object", () => {
            // Arrange
            const bin = {
                cli: "bin/cli.js",
                server: "bin/server.js",
            };
            const binName = "cli";

            // Act
            const result = resolveBinPath(mockPackage, bin, binName);

            // Assert
            expect(result).toBe(
                path.resolve("/workspace/packages/test-package", "bin/cli.js"),
            );
        });

        it("should return null for object-style bin when binName doesn't exist", () => {
            // Arrange
            const bin = {
                cli: "bin/cli.js",
            };
            const binName = "nonexistent";

            // Act
            const result = resolveBinPath(mockPackage, bin, binName);

            // Assert
            expect(result).toBeNull();
        });

        it("should return null when bin is null", () => {
            // Arrange
            const bin = null;
            const binName = "test-package";

            // Act
            const result = resolveBinPath(mockPackage, bin, binName);

            // Assert
            expect(result).toBeNull();
        });

        it("should return null when bin is undefined", () => {
            // Arrange
            const bin = undefined;
            const binName = "test-package";

            // Act
            const result = resolveBinPath(mockPackage, bin, binName);

            // Assert
            expect(result).toBeNull();
        });
    });

    describe("security - path traversal protection", () => {
        it("should reject parent directory traversal in string-style bin", () => {
            // Arrange
            const bin = "../../../etc/passwd";
            const binName = "test-package";

            // Act
            const result = resolveBinPath(mockPackage, bin, binName);

            // Assert
            expect(result).toBeNull();
        });

        it("should reject parent directory traversal in object-style bin", () => {
            // Arrange
            const bin = {
                malicious: "../../../usr/bin/malicious",
            };
            const binName = "malicious";

            // Act
            const result = resolveBinPath(mockPackage, bin, binName);

            // Assert
            expect(result).toBeNull();
        });

        it("should reject absolute paths in string-style bin", () => {
            // Arrange
            const bin = "/usr/bin/malicious";
            const binName = "test-package";

            // Act
            const result = resolveBinPath(mockPackage, bin, binName);

            // Assert
            expect(result).toBeNull();
        });

        it("should reject absolute paths in object-style bin", () => {
            // Arrange
            const bin = {
                malicious: "/usr/bin/malicious",
            };
            const binName = "malicious";

            // Act
            const result = resolveBinPath(mockPackage, bin, binName);

            // Assert
            expect(result).toBeNull();
        });

        it("should accept valid subdirectory paths", () => {
            // Arrange
            const bin = "bin/nested/script.js";
            const binName = "test-package";

            // Act
            const result = resolveBinPath(mockPackage, bin, binName);

            // Assert
            expect(result).toBe(
                path.resolve(
                    "/workspace/packages/test-package",
                    "bin/nested/script.js",
                ),
            );
        });

        it("should accept valid paths at package root", () => {
            // Arrange
            const bin = "index.js";
            const binName = "test-package";

            // Act
            const result = resolveBinPath(mockPackage, bin, binName);

            // Assert
            expect(result).toBe(
                path.resolve("/workspace/packages/test-package", "index.js"),
            );
        });

        it("should handle edge case where bin path equals package directory", () => {
            // Arrange
            const bin = ".";
            const binName = "test-package";

            // Act
            const result = resolveBinPath(mockPackage, bin, binName);

            // Assert
            expect(result).toBe(
                path.resolve("/workspace/packages/test-package"),
            );
        });

        it("should reject path that tries to escape with multiple parent references", () => {
            // Arrange
            const bin = {
                escape: "../../../../../../etc/shadow",
            };
            const binName = "escape";

            // Act
            const result = resolveBinPath(mockPackage, bin, binName);

            // Assert
            expect(result).toBeNull();
        });

        it("should handle path with backslashes (valid filename chars on Unix)", () => {
            // Arrange
            // On Unix, backslashes are valid filename characters, not path separators
            // On Windows, Node.js normalizes these to forward slashes before our check
            const bin = "bin\\script.js";
            const binName = "test-package";

            // Act
            const result = resolveBinPath(mockPackage, bin, binName);

            // Assert
            // Should resolve successfully since backslashes are just filename chars on Unix
            expect(result).toBe(
                path.resolve(
                    "/workspace/packages/test-package",
                    "bin\\script.js",
                ),
            );
        });
    });

    describe("type handling", () => {
        it("should return null when bin is a number", () => {
            // Arrange
            const bin: any = 123;
            const binName = "test-package";

            // Act
            const result = resolveBinPath(mockPackage, bin, binName);

            // Assert
            expect(result).toBeNull();
        });

        it("should return null when bin is a boolean", () => {
            // Arrange
            const bin: any = true;
            const binName = "test-package";

            // Act
            const result = resolveBinPath(mockPackage, bin, binName);

            // Assert
            expect(result).toBeNull();
        });

        it("should return null when bin is an empty object", () => {
            // Arrange
            const bin = {};
            const binName = "test-package";

            // Act
            const result = resolveBinPath(mockPackage, bin, binName);

            // Assert
            expect(result).toBeNull();
        });

        it("should return null when bin is an array", () => {
            // Arrange
            const bin: any = ["bin/cli.js"];
            const binName = "test-package";

            // Act
            const result = resolveBinPath(mockPackage, bin, binName);

            // Assert
            expect(result).toBeNull();
        });
    });

    describe("edge cases", () => {
        it("should handle package path with trailing slash", () => {
            // Arrange
            const packageWithTrailingSlash: PackageInfo = {
                name: "test-package",
                path: "/workspace/packages/test-package/",
                version: "1.0.0",
            };
            const bin = "bin/cli.js";
            const binName = "test-package";

            // Act
            const result = resolveBinPath(
                packageWithTrailingSlash,
                bin,
                binName,
            );

            // Assert
            expect(result).toBe(
                path.resolve("/workspace/packages/test-package/", "bin/cli.js"),
            );
        });

        it("should handle bin path with leading slash", () => {
            // Arrange
            const bin = "/bin/cli.js";
            const binName = "test-package";

            // Act
            const result = resolveBinPath(mockPackage, bin, binName);

            // Assert
            expect(result).toBeNull();
        });

        it("should handle bin path with only dots", () => {
            // Arrange
            const bin = "..";
            const binName = "test-package";

            // Act
            const result = resolveBinPath(mockPackage, bin, binName);

            // Assert
            expect(result).toBeNull();
        });

        it("should resolve relative path with current directory reference", () => {
            // Arrange
            const bin = "./bin/cli.js";
            const binName = "test-package";

            // Act
            const result = resolveBinPath(mockPackage, bin, binName);

            // Assert
            expect(result).toBe(
                path.resolve(
                    "/workspace/packages/test-package",
                    "./bin/cli.js",
                ),
            );
        });
    });
});
