#!/usr/bin/env node
import yargs from "yargs";
import {hideBin} from "yargs/helpers";
import {xImpl} from "../x-impl";

const argv = yargs(hideBin(process.argv))
    .usage("Usage: $0 <script-name> [...args]")
    .command(
        "$0 <script-name> [args..]",
        "Execute a bin script from any package in the workspace",
        (yargs) => {
            return yargs
                .positional("script-name", {
                    describe: "Name of the bin script to execute",
                    type: "string",
                    demandOption: true,
                })
                .positional("args", {
                    describe: "Arguments to pass to the script",
                    type: "string",
                    array: true,
                    default: [],
                });
        },
    )
    .option("dry-run", {
        alias: "d",
        describe: "Show what would be executed without running it",
        type: "boolean",
        default: false,
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
    .strict()
    .parseSync();

// Extract script name and args
const scriptName = argv["script-name"] as string;
const args = (argv._ as string[]) || [];
const options = {
    dryRun: argv["dry-run"] as boolean,
};

// Run the implementation and exit with the appropriate code
xImpl(scriptName, args, options)
    .then((result) => {
        process.exit(result.exitCode);
    })
    .catch((error) => {
        console.error("Unexpected error:", error);
        process.exit(1);
    });