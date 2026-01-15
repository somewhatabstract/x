import {execFile} from "node:child_process";
import {promisify} from "node:util";
import {HandledError} from "./errors";

const execFileAsync = promisify(execFile);

export interface PackageInfo {
    name: string;
    path: string;
    version: string;
}

/**
 * Discover all packages in the workspace using `pnpm list`.
 *
 * @param workspaceRoot - The absolute path to the workspace root
 * @returns Array of package information
 * @throws {HandledError} If pnpm list fails or returns invalid data
 */
export async function discoverPackages(
    workspaceRoot: string,
): Promise<PackageInfo[]> {
    try {
        const {stdout} = await execFileAsync(
            "pnpm",
            ["list", "--json", "--depth", "0", "--recursive"],
            {
                cwd: workspaceRoot,
                maxBuffer: 10 * 1024 * 1024, // 10MB buffer
            },
        );

        const packages = JSON.parse(stdout);

        if (!Array.isArray(packages)) {
            throw new HandledError(
                "Unexpected output from pnpm list. Expected an array.",
            );
        }

        return packages
            .filter((pkg: any) => pkg.name && pkg.path)
            .map((pkg: any) => ({
                name: pkg.name,
                path: pkg.path,
                version: pkg.version || "unknown",
            }));
    } catch (error: any) {
        if (error instanceof HandledError) {
            throw error;
        }

        if (error.code === "ENOENT") {
            throw new HandledError(
                "pnpm command not found. Make sure pnpm is installed.",
            );
        }

        throw new HandledError(
            `Failed to discover packages: ${error.message}`,
        );
    }
}
