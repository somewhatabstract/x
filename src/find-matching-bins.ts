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
                    matches.push({
                        packageName: pkg.name,
                        packagePath: pkg.path,
                        binName: pkg.name,
                        binPath: path.join(pkg.path, bin),
                    });
                }
            } else if (typeof bin === "object") {
                // If bin is an object, check if it has the requested bin name
                if (bin[binName]) {
                    matches.push({
                        packageName: pkg.name,
                        packagePath: pkg.path,
                        binName: binName,
                        binPath: path.join(pkg.path, bin[binName]),
                    });
                }
            }
        } catch (error) {
            // Skip packages that can't be read
            continue;
        }
    }

    return matches;
}
