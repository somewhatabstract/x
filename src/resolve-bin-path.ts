import path from "node:path";
import type {PackageInfo} from "./discover-packages";

/**
 * Resolve a bin script to the actual file path.
 *
 * This function ensures that the resolved bin path is within the package
 * directory to prevent path traversal issues.
 *
 * @param pkg - The package information containing the path to the package
 * @param bin - The bin entry from package.json, which can be a string or an
 * object
 * @param binName - The name of the bin as specified in package.json
 * @returns The resolved absolute path to the bin script, or null if invalid

 */
export function resolveBinPath(
    pkg: PackageInfo,
    bin: any,
    binName: string,
): string | null {
    // bin can be a string or an object
    const binPath: string | null = !bin
        ? null
        : typeof bin === "string" && pkg.name === binName
          ? // If bin is a string, the bin name is the package name
            bin
          : // If bin is an object, check if it has the requested bin name
            typeof bin === "object" && bin[binName]
            ? bin[binName]
            : null;

    if (!binPath) {
        return null;
    }

    const packageDir = path.resolve(pkg.path);
    const resolvedBinPath = path.resolve(pkg.path, binPath);
    // Ensure the bin path stays within the package directory
    if (
        resolvedBinPath !== packageDir &&
        !resolvedBinPath.startsWith(packageDir + path.sep)
    ) {
        return null;
    }

    return resolvedBinPath;
}
