import * as fs from "node:fs/promises";
import * as path from "node:path";

/**
 * Build environment variables for script execution that mimics npm/pnpm behavior.
 * The environment is set as if the package were installed at the workspace root.
 *
 * @param workspaceRoot - Path to the workspace root
 * @param currentEnv - Current environment variables (usually process.env)
 * @returns Environment object to pass to child_process.spawn
 */
export async function buildEnvironment(
    workspaceRoot: string,
    currentEnv: NodeJS.ProcessEnv,
): Promise<NodeJS.ProcessEnv> {
    // Read workspace root's package.json for metadata
    let workspacePackageJson: any = {};
    try {
        const packageJsonPath = path.join(workspaceRoot, "package.json");
        const content = await fs.readFile(packageJsonPath, "utf-8");
        workspacePackageJson = JSON.parse(content);
    } catch (error) {
        // If we can't read package.json, continue with empty metadata
    }

    // Get our own package version for user agent
    let ourPackageVersion = "0.0.0-development";
    try {
        const ownPackageJsonPath = path.join(__dirname, "..", "package.json");
        const ownPackageJsonContent = await fs.readFile(
            ownPackageJsonPath,
            "utf-8",
        );
        const ownPackageJson = JSON.parse(ownPackageJsonContent);
        if (typeof ownPackageJson.version === "string") {
            ourPackageVersion = ownPackageJson.version;
        }
    } catch {
        // If we can't read our own package.json, continue with fallback version
    }

    // Build the environment
    const env: NodeJS.ProcessEnv = {
        // Preserve all existing environment variables
        ...currentEnv,

        // PATH: Prepend workspace root's node_modules/.bin
        PATH: [
            path.join(workspaceRoot, "node_modules", ".bin"),
            currentEnv.PATH,
        ]
            .filter(Boolean)
            .join(path.delimiter),

        // npm lifecycle variables
        npm_command: "exec",
        npm_execpath: process.execPath,
        npm_node_execpath: process.execPath,
        NODE: process.execPath,
        INIT_CWD: process.cwd(),

        // User agent
        npm_config_user_agent: `x/${ourPackageVersion} node/${process.version} ${process.platform} ${process.arch}`,
    };

    // Add npm_package_* variables from workspace root's package.json
    if (workspacePackageJson.name) {
        env.npm_package_name = workspacePackageJson.name;
    }
    if (workspacePackageJson.version) {
        env.npm_package_version = workspacePackageJson.version;
    }
    if (workspacePackageJson.description) {
        env.npm_package_description = workspacePackageJson.description;
    }

    // Add other common package.json fields
    const commonFields = [
        "author",
        "license",
        "homepage",
        "repository",
        "bugs",
        "keywords",
    ];

    for (const field of commonFields) {
        if (workspacePackageJson[field]) {
            const value = workspacePackageJson[field];
            // Convert objects to JSON strings
            env[`npm_package_${field}`] =
                typeof value === "string" ? value : JSON.stringify(value);
        }
    }

    return env;
}
