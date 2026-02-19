import * as fs from "node:fs/promises";
import * as path from "node:path";
import type {PackageInfo} from "./discover-packages";

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

            if (!bin) {
                continue;
            }

            // bin can be a string or an object
            if (typeof bin === "string") {
                // If bin is a string, the bin name is the package name
                if (pkg.name === binName) {
                    const packageDir = path.resolve(pkg.path);
                    const resolvedBinPath = path.resolve(pkg.path, bin);
                    // Ensure the bin path stays within the package directory
                    if (!resolvedBinPath.startsWith(packageDir + path.sep)) {
                        continue;
                    }

                    matches.push({
                        packageName: pkg.name,
                        packagePath: pkg.path,
                        binName: pkg.name,
                        binPath: resolvedBinPath,
                    });
                }
            } else if (typeof bin === "object") {
                // If bin is an object, check if it has the requested bin name
                if (bin[binName]) {
                    const packageDir = path.resolve(pkg.path);
                    const resolvedBinPath = path.resolve(
                        pkg.path,
                        bin[binName],
                    );
                    // Ensure the bin path stays within the package directory
                    if (!resolvedBinPath.startsWith(packageDir + path.sep)) {
                        continue;
                    }

                    matches.push({
                        packageName: pkg.name,
                        packagePath: pkg.path,
                        binName: binName,
                        binPath: resolvedBinPath,
                    });
                }
            }
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
