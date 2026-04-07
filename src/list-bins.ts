import * as fs from "node:fs/promises";
import * as path from "node:path";
import type {PackageInfo} from "./discover-packages";

export interface PackageBinInfo {
    packageName: string;
    packagePath: string;
    bins: string[];
}

/**
 * Collect all bin script names from every package in the workspace.
 *
 * @param packages - List of packages from discoverPackages
 * @returns Array of per-package bin information, sorted by package name
 */
export async function listAllBins(
    packages: PackageInfo[],
): Promise<PackageBinInfo[]> {
    const result: PackageBinInfo[] = [];

    for (const pkg of packages) {
        try {
            const packageJsonPath = path.join(pkg.path, "package.json");
            const packageJsonContent = await fs.readFile(
                packageJsonPath,
                "utf-8",
            );
            const packageJson = JSON.parse(packageJsonContent);

            const bin = packageJson.bin;
            if (!bin) {
                continue;
            }

            let binNames: string[];
            if (typeof bin === "string") {
                binNames = [pkg.name];
            } else if (typeof bin === "object" && bin !== null) {
                binNames = Object.keys(bin);
            } else {
                continue;
            }

            if (binNames.length > 0) {
                result.push({
                    packageName: pkg.name,
                    packagePath: pkg.path,
                    bins: [...binNames].sort(),
                });
            }
        } catch (error: unknown) {
            // Skip packages that can't be read. Log malformed JSON so it can be diagnosed.
            if (error instanceof SyntaxError) {
                console.warn(
                    `Warning: Failed to parse package.json for package "${pkg.name}" at "${pkg.path}": invalid JSON.`,
                );
            } else if (
                error &&
                typeof error === "object" &&
                "code" in error &&
                error.code === "ENOENT"
            ) {
                // package.json not found - this can be expected for some paths
            } else {
                console.warn(
                    `Warning: Could not read package.json for package "${pkg.name}" at "${pkg.path}":`,
                    error,
                );
            }
        }
    }

    return result;
}
