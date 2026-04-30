import {discoverPackages} from "./discover-packages";
import {HandledError} from "./errors";
import {listAllBins, type PackageBinInfo} from "./list-bins";

/**
 * Get all bins from all packages in the workspace.
 *
 * @returns An array of PackageBinInfo objects containing package name, path,
 * and bins
 * @throws {HandledError} If no packages are found
 */
export async function getAllBins(
    workspaceRoot: string,
): Promise<PackageBinInfo[]> {
    const packages = await discoverPackages(workspaceRoot);

    if (packages.length === 0) {
        throw new HandledError(
            "No packages found in workspace. Is this a valid monorepo?",
        );
    }

    return await listAllBins(packages);
}
