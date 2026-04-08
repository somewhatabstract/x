#!/usr/bin/env node
import {fileURLToPath} from "node:url";
import yargs from "yargs";
import {hideBin} from "yargs/helpers";
import {HandledError} from "../errors";
import {listImpl} from "../list-impl";
import {xImpl} from "../x-impl";

export async function main(): Promise<void> {
    const rawArgs = hideBin(process.argv);

    const argv = yargs(rawArgs)
        .usage("Usage: $0 <script-name> [...args]")
        .command(
            "$0 [script-name]",
            "Execute a bin script from any package in the workspace",
            (yargs) => {
                return yargs.positional("script-name", {
                    describe: "Name of the bin script to execute",
                    type: "string",
                    demandOption: false,
                });
            },
        )
        .option("list", {
            alias: "l",
            describe:
                "List available commands. Use --list=full to include package details",
            type: "string",
        })
        .option("json", {
            describe: "Output in JSON format (use with --list)",
            type: "boolean",
            default: false,
        })
        .option("dry-run", {
            alias: "d",
            describe: "Show what would be executed without running it",
            type: "boolean",
            default: false,
        })
        .check((argv) => {
            if (
                argv.list === undefined &&
                !(argv["script-name"] as string | undefined)?.trim()
            ) {
                throw new Error(
                    "script-name is required. Use --list to see available commands.",
                );
            }
            return true;
        })
        .help()
        .alias("help", "h")
        .version()
        .alias("version", "v")
        .example("$0 tsc --noEmit", "Run TypeScript compiler from any package")
        .example(
            "$0 eslint src/",
            "Run ESLint from any package that provides it",
        )
        .example("$0 --dry-run jest", "Preview which jest would be executed")
        .example("$0 --list", "List all available commands")
        .example("$0 --list=full", "List commands grouped by package")
        .example("$0 --list --json", "List commands as JSON")
        .parserConfiguration({"unknown-options-as-args": true})
        .parseSync();

    // Check if we are in list mode
    const listArg = argv.list;
    if (listArg !== undefined) {
        const mode = listArg === "full" ? "full" : "names-only";
        const json = !!argv.json;
        const result = await listImpl({mode, json});
        process.exit(result.exitCode);
        return;
    }

    // Extract script name and args
    const scriptName = argv["script-name"] as string;

    const args = (argv._ as string[]) || [];
    const options = {
        dryRun: argv["dry-run"] as boolean,
    };

    // If any args look like flags and -- was not used, warn the user and suggest
    // using -- to explicitly separate flag arguments from x's own options.
    if (!rawArgs.includes("--")) {
        const flagLikeArgs = args.filter(
            (arg) => typeof arg === "string" && arg.startsWith("-"),
        );
        if (flagLikeArgs.length > 0) {
            console.warn(
                `Tip: To pass flags to "${scriptName}", use '--' to separate them:`,
            );
            console.warn(`  x ${scriptName} -- ${args.join(" ")}`);
        }
    }

    const result = await xImpl(scriptName, args, options);
    process.exit(result.exitCode);
    return;
}

// Only execute when this file is the entry point, not when imported.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    try {
        await main();
    } catch (error) {
        if (error instanceof HandledError) {
            console.error(`Error: ${error.message}`);
        } else {
            console.error("Unexpected error:", error);
        }
        process.exit(1);
    }
}
