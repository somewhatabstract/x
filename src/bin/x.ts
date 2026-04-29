#!/usr/bin/env node
import {pathToFileURL} from "node:url";
import yargs, {type Argv} from "yargs";
import {hideBin} from "yargs/helpers";
import {generateSplash} from "../generate-splash";
import {type XResult, xImpl} from "../x-impl";

const outputHelpAndExit = (parsedYargs: Argv, msg?: string): void => {
    process.stdout.write(generateSplash());
    parsedYargs.showHelp();
    if (msg) {
        console.error(`\n ${msg}`);
    }
};

export async function main(rawArgv: string[]): Promise<XResult> {
    const rawArgs = hideBin(rawArgv);
    const yi = yargs(rawArgs)
        .usage("Usage: $0 <script-name> [...args]")
        .command(
            "$0 <script-name>",
            "Execute a bin script from any package in the workspace",
            (yargs) => {
                return yargs.positional("script-name", {
                    describe: "Name of the bin script to execute",
                    type: "string",
                    demandOption: true,
                });
            },
        )
        .option("dry-run", {
            alias: "d",
            describe: "Show what would be executed without running it",
            type: "boolean",
            default: false,
        })
        .help(false)
        .option("help", {
            alias: "h",
            type: "boolean",
            describe: "Show help",
            default: false,
        })
        .fail((msg, _err, yargs) => {
            outputHelpAndExit(yargs, msg);
            process.exit(1);
        })
        .version()
        .alias("version", "v")
        .example("$0 tsc --noEmit", "Run TypeScript compiler from any package")
        .example(
            "$0 eslint src/",
            "Run ESLint from any package that provides it",
        )
        .example("$0 --dry-run jest", "Preview which jest would be executed")
        .parserConfiguration({"unknown-options-as-args": true});

    const argv = await yi.parse();

    if (argv.help || argv.h) {
        outputHelpAndExit(yi);
        return {exitCode: 0};
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

    // Run the implementation and exit with the appropriate code
    return xImpl(scriptName, args, options);
}

// Only run main if we aren't being imported as a module.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    main(process.argv)
        .then((result) => {
            process.exit(result.exitCode);
        })
        .catch((error) => {
            console.error("Unexpected error:", error);
            process.exit(1);
        });
}
