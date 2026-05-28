#!/usr/bin/env node
import {realpathSync} from "node:fs";
import {basename} from "node:path";
import {fileURLToPath} from "node:url";
import yargs, {type Argv} from "yargs";
import {hideBin} from "yargs/helpers";
import {HandledError} from "../errors";
import {getCompletions} from "../get-completions";
import {listImpl} from "../list-impl";
import {outputHelpWithSplash} from "../output-help-with-splash";
import {validateArgv} from "../validate-argv";
import {type XResult, xImpl} from "../x-impl";

const POSITIONAL_NAMES = new Set(["script-name", "scriptName"]);

/**
 * Collect the flag forms (e.g. "--list", "-l") of all of x's own options from
 * a configured yargs instance after parsing. Keeps the warning logic in sync
 * with the yargs config without a hand-maintained list.
 */
function collectXFlags(yi: Argv): Set<string> {
    const flags = new Set<string>();
    const parsed = yi.parsed;
    if (parsed && typeof parsed === "object") {
        for (const name of Object.keys(parsed.aliases)) {
            if (POSITIONAL_NAMES.has(name)) continue;
            flags.add(name.length === 1 ? `-${name}` : `--${name}`);
        }
    }
    // --completion is registered as a yargs completion command, not an
    // option, so it doesn't appear in parsed.aliases.
    flags.add("--completion");
    return flags;
}

export async function main(rawArgv: string[]): Promise<XResult> {
    const rawArgs = hideBin(rawArgv);

    // We have to do our own completion handling because yargs doesn't support
    // async completion functions, and we need to do async work to get the
    // completions (finding workspace root and reading package bins).
    if (rawArgs.includes("--get-yargs-completions")) {
        const completions = await getCompletions(rawArgs);
        for (const b of completions) {
            console.log(b);
        }
        return {exitCode: 0};
    }

    const yi = yargs(rawArgs)
        .usage("Usage: $0 <script-name> [...args]")
        .command(
            "$0 [script-name]",
            "Execute a bin script from any package in the workspace",
            (yargs) =>
                yargs.positional("script-name", {
                    describe: "Name of the bin script to execute",
                    type: "string",
                    demandOption: false,
                }),
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
        .check((argv) => validateArgv(argv))
        // We're handling help text ourselves so we can include the spash.
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
        // The default yargs completion command is "completion", but that could
        // be the name of a script we are asked to run, so let's make this
        // something unlikely to conflict with real script names.
        .completion("--completion", "Generate shell completion script")
        // This is needed to allow passing args that look like flags to the
        // script we are executing without yargs trying to parse them. With
        // this, any unknown options will be collected in argv._ instead of
        // causing an error. Users will need to use -- to separate x's options
        // from the script's options, but we will also do a best effort to
        // detect if they forgot to do that and warn them.
        .parserConfiguration({"unknown-options-as-args": true});

    // If we have a process.env._ and it doesn't end with `x.mjs`, then it's
    // likely we were invoked by another tool like pnpm or node.
    // We want the scriptname to reflect, as best we can, what the user
    // invoked.
    const argv =
        process.env._ && basename(process.env._) === "x.mjs"
            ? await yi.parse()
            : await yi.scriptName("x").parse();

    // If one of x's own option flags appears after the script name without
    // using `--`, it was consumed by x rather than forwarded to the script.
    // Tip the user off so they can disambiguate. This must happen BEFORE the
    // early-exit branches for --help/--list/etc. — those branches are exactly
    // the cases where x is about to do something other than what the user
    // probably intended. Flags before the script name are unambiguously for x.
    // Suppressed when NO_WARN is set.
    const scriptName = (argv["script-name"] as string | undefined)?.trim();
    if (scriptName && !process.env.NO_WARN && !rawArgs.includes("--")) {
        const scriptIdx = rawArgs.indexOf(scriptName);
        if (scriptIdx >= 0) {
            const beforeScript = rawArgs.slice(0, scriptIdx);
            const afterScript = rawArgs.slice(scriptIdx + 1);
            const xFlags = collectXFlags(yi);
            const hasXFlagAfterScript = afterScript.some(
                (arg) => xFlags.has(arg) || xFlags.has(arg.split("=")[0]),
            );
            if (hasXFlagAfterScript) {
                const prefix = [...beforeScript, scriptName].join(" ");
                console.warn(
                    `Tip: To pass flags to "${scriptName}", use '--' to separate them:`,
                );
                console.warn(`  x ${prefix} -- ${afterScript.join(" ")}`);
                console.warn(`(Set NO_WARN=1 to silence this tip.)`);
            }
        }
    }

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

    // Run the implementation and exit with the appropriate code. scriptName
    // is guaranteed non-empty here by validateArgv (since --list/--help
    // would have early-exited above if it was missing).
    return xImpl(scriptName as string, args, options);
}

// Only run main if we aren't being imported as a module.
/* v8 ignore start -- runtime-only CLI bootstrap */
if (realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
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
