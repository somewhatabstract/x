#!/usr/bin/env node
import {fileURLToPath} from "node:url";
import yargs from "yargs";
import {hideBin} from "yargs/helpers";
import {HandledError} from "../errors";
import {listImpl} from "../list-impl";
import {outputHelpWithSplash} from "../output-help-with-splash";
import {type XResult, xImpl} from "../x-impl";

export async function main(rawArgv: string[]): Promise<XResult> {
    const rawArgs = hideBin(rawArgv);
    const yi = yargs(rawArgs)
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
        .help(false)
        .option("help", {
            alias: "h",
            type: "boolean",
            describe: "Show help",
            default: false,
        })
        .fail((msg, _err, yargs) => {
            outputHelpWithSplash(yargs, msg);
            process.exit(1);
        })
        .version()
        .alias("version", "v")
        .example(
            "$0 my-tool --myArg",
            "Run the bin my-tool from a package in the workspace with the --myArg flag",
        )
        .example(
            "$0 --dry-run my-tool",
            "Preview how the my-tool bin would be resolved",
        )
        .example("$0 --list", "List all available bin scripts")
        .example(
            "$0 --list=full",
            "List available bin scripts grouped by package",
        )
        .example("$0 --list --json", "List commands as JSON")
        .parserConfiguration({"unknown-options-as-args": true});

    const argv = await yi.parse();

    if (argv.help || argv.h) {
        outputHelpWithSplash(yi);
        return {exitCode: 0};
    }

    // Check if we are in list mode
    const listArg = argv.list;
    if (listArg !== undefined) {
        const mode = listArg === "full" ? "full" : "names-only";
        const json = !!argv.json;
        return await listImpl({mode, json});
    }

    const args = (argv._ as string[]) || [];
    const options = {
        dryRun: argv["dry-run"] as boolean,
    };

    // If any args look like flags and -- was not used, warn the user and suggest
    // using -- to explicitly separate flag arguments from x's own options.
    const scriptName = (argv["script-name"] as string).trim();
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

    // Run the implementation and exit with the appropriate code
    return xImpl(scriptName, args, options);
}

// Only run main if we aren't being imported as a module.
/* v8 ignore start -- runtime-only CLI bootstrap */
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main(process.argv)
        .then((result) => {
            process.exit(result.exitCode);
        })
        .catch((error) => {
            if (error instanceof HandledError) {
                console.error(`Error: ${error.message}`);
            } else {
                console.error("Unexpected error:", error);
            }
            process.exit(1);
        });
}
/* v8 ignore stop -- runtime-only CLI bootstrap */
