import * as path from "node:path";
import {discoverPackages} from "./discover-packages";
import {HandledError} from "./errors";
import {findWorkspaceRoot} from "./find-workspace-root";
import {listAllBins} from "./list-bins";

export type ListMode = "names-only" | "full";

export interface ListOptions {
    mode: ListMode;
    json: boolean;
}

export interface ListResult {
    exitCode: number;
}

/**
 * List available bin scripts in the workspace.
 *
 * @param options - Listing options (mode and JSON flag)
 * @returns Result object with exit code
 */
export async function listImpl(options: ListOptions): Promise<ListResult> {
    try {
        const workspaceRoot = await findWorkspaceRoot();
        const packages = await discoverPackages(workspaceRoot);

        if (packages.length === 0) {
            throw new HandledError(
                "No packages found in workspace. Is this a valid monorepo?",
            );
        }

        const packageBins = await listAllBins(packages);

        if (options.mode === "names-only") {
            // Collect all unique bin names, sorted lexicographically
            const allBinNames = packageBins.flatMap((pkg) => pkg.bins);
            const uniqueBinNames = [...new Set(allBinNames)].sort();

            if (options.json) {
                console.log(JSON.stringify(uniqueBinNames));
            } else {
                for (const name of uniqueBinNames) {
                    console.log(name);
                }
            }
        } else {
            // full mode: grouped by package, sorted lexicographically by package name
            const sorted = [...packageBins].sort((a, b) =>
                a.packageName.localeCompare(b.packageName),
            );

            if (options.json) {
                const output: Record<
                    string,
                    {path: string; scripts: string[]}
                > = {};
                for (const pkg of sorted) {
                    const relativePath = path.relative(
                        workspaceRoot,
                        pkg.packagePath,
                    );
                    output[pkg.packageName] = {
                        path: `./${relativePath}`,
                        scripts: [...pkg.bins].sort(),
                    };
                }
                console.log(JSON.stringify(output));
            } else {
                for (const pkg of sorted) {
                    const relativePath = path.relative(
                        workspaceRoot,
                        pkg.packagePath,
                    );
                    console.log(`${pkg.packageName} (./${relativePath})`);
                    for (const bin of [...pkg.bins].sort()) {
                        console.log(`   ${bin}`);
                    }
                    console.log();
                }
            }
        }

        return {exitCode: 0};
    } catch (error) {
        if (error instanceof HandledError) {
            console.error(`Error: ${error.message}`);
            return {exitCode: 1};
        }
        throw error;
    }
}
