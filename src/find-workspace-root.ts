import {closesdir} from "ancesdir";
import {HandledError} from "./errors";

/**
 * Find the workspace root by looking for pnpm-workspace.yaml or similar
 * workspace configuration files.
 *
 * @param startDir - Directory to start searching from (defaults to cwd)
 * @returns The absolute path to the workspace root
 * @throws {HandledError} If workspace root cannot be found
 */
export async function findWorkspaceRoot(
    startDir: string = process.cwd(),
): Promise<string> {
    try {
        // Look for pnpm-workspace.yaml
        // Use closesdir to include the starting directory in the search
        const result = closesdir(startDir, "pnpm-workspace.yaml");
        return result;
    } catch (error: any) {
        throw new HandledError(
            "Could not find workspace root. Make sure you're in a pnpm workspace (pnpm-workspace.yaml not found).",
        );
    }
}
