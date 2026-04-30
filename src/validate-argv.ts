import type {Arguments} from "yargs";

/**
 * Validate the command-line arguments.
 *
 * @param argv The parsed command-line arguments.
 * @returns `true` if the arguments are valid, otherwise throws an error with a
 * descriptive message.
 * @throws Error if the arguments are invalid.
 */
export function validateArgv<T extends Arguments>(argv: T): true {
    if (argv.json && argv.list === undefined) {
        throw new Error("--json requires --list to be specified.");
    }
    if (argv.dryRun && argv.list !== undefined) {
        throw new Error("--dry-run cannot be used with --list.");
    }
    if (
        argv.list === undefined &&
        !(argv["script-name"] as string | undefined)?.trim()
    ) {
        throw new Error(
            "script-name is required. Use --list to see available commands.",
        );
    }
    return true;
}
