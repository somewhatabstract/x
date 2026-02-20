import {spawn} from "node:child_process";
import {buildEnvironment} from "./build-environment";
import type {BinInfo} from "./find-matching-bins";
import {isNodeExecutable} from "./is-node-executable";

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

    // For .js/.mjs/.cjs files, invoke via node (matching npm behavior).
    // The original binPath casing is preserved in the spawn call.
    const [executable, spawnArgs] = isNodeExecutable(bin.binPath)
        ? [process.execPath, [bin.binPath, ...args]]
        : [bin.binPath, args];

    return new Promise((resolve) => {
        const child = spawn(executable, spawnArgs, {
            // Don't change directory - execute in current directory
            // as if the bin were installed at workspace root
            stdio: "inherit",
            env,
        });

        child.on("error", (_) => {
            // Handle spawn errors (ENOENT, EACCES, etc.)
            resolve(1);
        });

        child.on("exit", (code, signal) => {
            // If killed by signal, we could use exit code 128 + signal number,
            // (a common convention), however, for simplicity, we'll just
            // return 1 for any signal-based termination as it's not clear
            // that we need to distinguish between different signals in this
            // context.
            if (signal) {
                resolve(1);
            } else {
                resolve(code ?? 1);
            }
        });
    });
}
