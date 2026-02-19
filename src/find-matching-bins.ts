import * as fs from "node:fs/promises";
import * as path from "node:path";
import type {PackageInfo} from "./discover-packages";
import { resolveBinPath } from "./resolve-bin-path";

export interface BinInfo {
    packageName: string;
    packagePath: string;
    binName: string;
    binPath: string;
}

/**
 * Find all packages that have a bin script matching the given name.
 *
 * @param packages - List of packages from discoverPackages
 * @param binName - Name of the bin script to find
 * @returns Array of matching bin information
 */
export async function findMatchingBins(
    packages: PackageInfo[],
    binName: string,
): Promise<BinInfo[]> {
    const matches: BinInfo[] = [];

    for (const pkg of packages) {
        try {
            const packageJsonPath = path.join(pkg.path, "package.json");
            const packageJsonContent = await fs.readFile(
                packageJsonPath,
                "utf-8",
            );
            const packageJson = JSON.parse(packageJsonContent);

            const bin = packageJson.bin;
            const resolvedBinPath = resolveBinPath(pkg, bin, binName);
            if (!resolvedBinPath) {
                continue;
            }

            matches.push({
                packageName: pkg.name,
                packagePath: pkg.path,
                binName: binName,
                binPath: resolvedBinPath,
            });
        } catch (error) {
            // Skip packages that can't be read. Log malformed JSON so it can be diagnosed.
            const err: any = error;
            if (error instanceof SyntaxError) {
                // Invalid JSON in package.json
                console.warn(
                    `Warning: Failed to parse package.json for package "${pkg.name}" at "${pkg.path}": invalid JSON.`,
                );
            } else if (err && err.code === "ENOENT") {
                // package.json not found - this can be expected for some paths
            } else {
                // Other unexpected errors when reading package.json
                console.warn(
                    `Warning: Could not read package.json for package "${pkg.name}" at "${pkg.path}":`,
                    error,
                );
            }
            continue;
        }
    }

    return matches;
}
