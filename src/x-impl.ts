import {findWorkspaceRoot} from "./find-workspace-root";
import {discoverPackages} from "./discover-packages";
import {findMatchingBins} from "./find-matching-bins";
import {executeScript} from "./execute-script";
import {HandledError} from "./errors";

export interface XOptions {
    dryRun?: boolean;
}

export interface XResult {
    exitCode: number;
}

/**
 * Main implementation of the x command.
 * Finds and executes a bin script from any package in the workspace.
 *
 * @param scriptName - Name of the bin script to execute
 * @param args - Arguments to pass to the script
 * @param options - Additional options
 * @returns Result object with exit code
 */
export async function xImpl(
    scriptName: string,
    args: string[] = [],
    options: XOptions = {},
): Promise<XResult> {
    try {
        // Find workspace root
        const workspaceRoot = await findWorkspaceRoot();

        // Discover all packages
        const packages = await discoverPackages(workspaceRoot);

        if (packages.length === 0) {
            throw new HandledError(
                "No packages found in workspace. Is this a valid monorepo?",
            );
        }

        // Find matching bins
        const matchingBins = await findMatchingBins(packages, scriptName);

        if (matchingBins.length === 0) {
            throw new HandledError(
                `No bin script named "${scriptName}" found in any workspace package.`,
            );
        }

        if (matchingBins.length > 1) {
            console.error(
                `Multiple packages provide bin "${scriptName}". Please be more specific.`,
            );
            console.error("\nMatching packages:");
            matchingBins.forEach((bin) => {
                console.error(`  - ${bin.packageName} (${bin.packagePath})`);
            });
            throw new HandledError(
                `Ambiguous bin name "${scriptName}". Found ${matchingBins.length} matches.`,
            );
        }

        const bin = matchingBins[0];

        // Dry run mode - just show what would be executed
        if (options.dryRun) {
            console.log(
                `Would execute: ${bin.binName} from ${bin.packageName}`,
            );
            console.log(`  Binary: ${bin.binPath}`);
            console.log(`  Arguments: ${args.join(" ")}`);
            return {exitCode: 0};
        }

        // Execute the script
        const exitCode = await executeScript(bin, args);

        return {exitCode};
    } catch (error) {
        if (error instanceof HandledError) {
            console.error(`Error: ${error.message}`);
            return {exitCode: 1};
        }
        throw error;
    }
}