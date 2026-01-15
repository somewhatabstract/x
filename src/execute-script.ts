import {spawn} from "node:child_process";
import * as fs from "node:fs/promises";
import type {BinInfo} from "./find-matching-bins";

/**
 * Read the shebang line from a file to determine the interpreter.
 * Falls back to 'node' if no shebang is found or it can't be parsed.
 */
async function getInterpreter(filePath: string): Promise<string[]> {
    try {
        const content = await fs.readFile(filePath, "utf-8");
        const firstLine = content.split("\n")[0];

        if (firstLine.startsWith("#!")) {
            // Extract the shebang
            const shebang = firstLine.slice(2).trim();

            // Handle common cases
            if (shebang.includes("node")) {
                return ["node"];
            }

            // Split shebang into command and args
            const parts = shebang.split(/\s+/);
            if (parts.length > 0) {
                // Handle /usr/bin/env style shebangs
                if (parts[0].endsWith("/env") && parts.length > 1) {
                    return parts.slice(1);
                }
                // Direct path to interpreter
                return parts;
            }
        }
    } catch (error) {
        // If we can't read the file, fall back to node
    }

    // Default to node
    return ["node"];
}

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
    const interpreter = await getInterpreter(bin.binPath);

    return new Promise((resolve) => {
        const child = spawn(interpreter[0], [...interpreter.slice(1), bin.binPath, ...args], {
            cwd: bin.packagePath,
            stdio: "inherit",
        });

        child.on("exit", (code) => {
            resolve(code ?? 1);
        });
    });
}
