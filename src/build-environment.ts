import * as fs from "node:fs/promises";
import * as path from "node:path";

/**
 * Build environment variables for script execution that mimics npm/pnpm behavior.
 * The environment is set as if the package were installed at the workspace root.
 *
 * Variables already provided by the parent npm/pnpm process are left as-is;
 * only missing ones are filled in. This means no redundant work when invoked
 * via `pnpm x`, while still working correctly when invoked directly (e.g.
 * during development from `./dist`).
 *
 * @param workspaceRoot - Path to the workspace root
 * @param currentEnv - Current environment variables (usually process.env)
 * @returns Environment object to pass to child_process.spawn
 */
export async function buildEnvironment(
    workspaceRoot: string,
    currentEnv: NodeJS.ProcessEnv,
): Promise<NodeJS.ProcessEnv> {
    const env: NodeJS.ProcessEnv = {...currentEnv};

    // PATH: only prepend workspace's node_modules/.bin if not already present.
    const workspaceBin = path.join(workspaceRoot, "node_modules", ".bin");
    const pathEntries = (currentEnv.PATH ?? "").split(path.delimiter);
    if (!pathEntries.includes(workspaceBin)) {
        env.PATH = [workspaceBin, currentEnv.PATH]
            .filter(Boolean)
            .join(path.delimiter);
    }

    // npm lifecycle variables: only set if the parent process didn't already.
    env.npm_command ??= "exec";
    env.npm_execpath ??= process.execPath;
    env.npm_node_execpath ??= process.execPath;
    env.NODE ??= process.execPath;
    env.INIT_CWD ??= process.cwd();

    // User agent: always identify as x regardless of invoking tool.
    let ourPackageVersion = "0.0.0-development";
    try {
        const ownPackageJsonPath = path.join(__dirname, "..", "package.json");
        const ownPackageJson = JSON.parse(
            await fs.readFile(ownPackageJsonPath, "utf-8"),
        );
        if (typeof ownPackageJson.version === "string") {
            ourPackageVersion = ownPackageJson.version;
        }
    } catch {
        // fall through with development version
    }
    env.npm_config_user_agent = `x/${ourPackageVersion} node/${process.version} ${process.platform} ${process.arch}`;

    // npm_package_* variables: only read and populate if npm/pnpm hasn't already
    // set them (indicated by npm_package_name being absent).
    if (!currentEnv.npm_package_name) {
        let workspacePackageJson: Record<string, unknown> = {};
        try {
            const packageJsonPath = path.join(workspaceRoot, "package.json");
            workspacePackageJson = JSON.parse(
                await fs.readFile(packageJsonPath, "utf-8"),
            );
        } catch {
            // fall through with empty metadata
        }

        const fields = [
            "name",
            "version",
            "description",
            "author",
            "license",
            "homepage",
            "repository",
            "bugs",
            "keywords",
        ];
        for (const field of fields) {
            const value = workspacePackageJson[field];
            if (value != null) {
                env[`npm_package_${field}`] =
                    typeof value === "string" ? value : JSON.stringify(value);
            }
        }
    }

    return env;
}
