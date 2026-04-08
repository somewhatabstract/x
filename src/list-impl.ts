import * as path from "node:path";
import {discoverPackages} from "./discover-packages";
import {HandledError} from "./errors";
import {findWorkspaceRoot} from "./find-workspace-root";
import {type PackageBinInfo, listAllBins} from "./list-bins";

export type ListMode = "names-only" | "full";

export interface ListOptions {
    mode: ListMode;
    json: boolean;
}

export interface ListResult {
    exitCode: number;
}

function listNamesOnly(packageBins: PackageBinInfo[], json: boolean): void {
    const uniqueBinNames = [
        ...new Set(packageBins.flatMap((pkg) => pkg.bins)),
    ].sort();

    if (json) {
        console.log(JSON.stringify(uniqueBinNames));
        return;
    }

    for (const name of uniqueBinNames) {
        console.log(name);
    }
}

function listFull(
    packageBins: PackageBinInfo[],
    workspaceRoot: string,
    json: boolean,
): void {
    const sorted = [...packageBins].sort((a, b) =>
        a.packageName.localeCompare(b.packageName),
    );

    if (json) {
        const output: Record<string, {path: string; scripts: string[]}> = {};
        for (const pkg of sorted) {
            output[pkg.packageName] = {
                path: `./${path.relative(workspaceRoot, pkg.packagePath)}`,
                scripts: [...pkg.bins].sort(),
            };
        }
        console.log(JSON.stringify(output));
        return;
    }

    for (const pkg of sorted) {
        console.log(
            `${pkg.packageName} (./${path.relative(workspaceRoot, pkg.packagePath)})`,
        );
        for (const bin of [...pkg.bins].sort()) {
            console.log(`   ${bin}`);
        }
        console.log();
    }
}

/**
 * List available bin scripts in the workspace.
 *
 * @param options - Listing options (mode and JSON flag)
 * @returns Result object with exit code
 */
export async function listImpl(options: ListOptions): Promise<ListResult> {
    const workspaceRoot = await findWorkspaceRoot();
    const packages = await discoverPackages(workspaceRoot);

    if (packages.length === 0) {
        throw new HandledError(
            "No packages found in workspace. Is this a valid monorepo?",
        );
    }

    const packageBins = await listAllBins(packages);

    if (options.mode === "names-only") {
        listNamesOnly(packageBins, options.json);
        return {exitCode: 0};
    }

    listFull(packageBins, workspaceRoot, options.json);
    return {exitCode: 0};
}
