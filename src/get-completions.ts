import {findWorkspaceRoot} from "./find-workspace-root";
import {getAllBins} from "./get-all-bins";
import {hasCommandAlreadyTyped} from "./has-command-already-typed";

/**
 * Get shell completion suggestions from available bin scripts in the workspace.
 *
 * @param rawArgs The raw command line arguments passed to x, including the
 * "--get-yargs-completions" flag and any partial command the user has typed.
 * @returns A list of completion suggestions based on the available bin scripts
 * in the workspace, or an empty list if a command has already been typed or if
 * there was an error finding bins.
 */
export async function getCompletions(rawArgs: string[]): Promise<string[]> {
    if (hasCommandAlreadyTyped(rawArgs)) {
        return [];
    }
    try {
        const workspaceRoot = await findWorkspaceRoot();
        const bins = await getAllBins(workspaceRoot);
        return [...new Set(bins.flatMap((pkg) => pkg.bins))].sort();
    } catch {
        return [];
    }
}
