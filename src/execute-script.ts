import {spawn} from "node:child_process";
import type {BinInfo} from "./find-matching-bins";
import {buildEnvironment} from "./build-environment";

/**
 * Execute a bin script with the given arguments.
 * Executes the script as if the package were installed at the workspace root,
 * with npm/pnpm-style environment variables.
 *
 * @param bin - The bin info to execute
 * @param args - Arguments to pass to the script
 * @param workspaceRoot - Path to the workspace root
 * @returns A promise that resolves with the exit code
 */
export async function executeScript(
    bin: BinInfo,
    args: string[],
    workspaceRoot: string,
): Promise<number> {
    // Build environment with npm/pnpm-style variables
    const env = await buildEnvironment(workspaceRoot, process.env);

    return new Promise((resolve) => {
        const child = spawn(bin.binPath, args, {
            // Don't change directory - execute in current directory
            // as if the bin were installed at workspace root
            stdio: "inherit",
            env,
        });

        child.on("exit", (code) => {
            resolve(code ?? 1);
        });
    });
}
