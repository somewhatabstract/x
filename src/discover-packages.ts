import {getPackages} from "@manypkg/get-packages";
import {HandledError} from "./errors";

export interface PackageInfo {
    name: string;
    path: string;
    version: string;
}

/**
 * Discover all packages in the workspace using @manypkg/get-packages.
 * Supports multiple package managers: npm, yarn, pnpm, lerna, bun, rush.
 *
 * @param workspaceRoot - The absolute path to the workspace root
 * @returns Array of package information
 * @throws {HandledError} If package discovery fails
 */
export async function discoverPackages(
    workspaceRoot: string,
): Promise<PackageInfo[]> {
    try {
        const result = await getPackages(workspaceRoot);

        return result.packages.map((pkg) => ({
            name: pkg.packageJson.name,
            path: pkg.dir,
            version: pkg.packageJson.version || "unknown",
        }));
    } catch (error: any) {
        if (error instanceof HandledError) {
            throw error;
        }

        const errorMessage = (error as any)?.message ?? String(error);
        throw new HandledError(`Failed to discover packages: ${errorMessage}`);
    }
}
