import {findRoot} from "@manypkg/find-root";
import {HandledError} from "./errors";

/**
 * Find the workspace root using @manypkg/find-root.
 * Supports multiple package managers: npm, yarn, pnpm, lerna, bun, rush.
 *
 * @param startDir - Directory to start searching from (defaults to cwd)
 * @returns The absolute path to the workspace root
 * @throws {HandledError} If workspace root cannot be found
 */
export async function findWorkspaceRoot(
    startDir: string = process.cwd(),
): Promise<string> {
    try {
        const result = await findRoot(startDir);
        return result.rootDir;
    } catch (error: unknown) {
        throw new HandledError(
            "Could not find workspace root. Make sure you're in a monorepo workspace.",
            {cause: error},
        );
    }
}
