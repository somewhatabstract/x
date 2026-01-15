import {spawn} from "node:child_process";
import type {BinInfo} from "./find-matching-bins";

/**
 * Execute a bin script with the given arguments.
 *
 * @param bin - The bin info to execute
 * @param args - Arguments to pass to the script
 * @returns A promise that resolves with the exit code
 */
export async function executeScript(
    bin: BinInfo,
    args: string[],
): Promise<number> {
    return new Promise((resolve) => {
        const child = spawn("node", [bin.binPath, ...args], {
            cwd: bin.packagePath,
            stdio: "inherit",
        });

        child.on("exit", (code) => {
            resolve(code ?? 1);
        });
    });
}
