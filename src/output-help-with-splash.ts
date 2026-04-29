import type {Argv} from "yargs";
import {generateSplash} from "./generate-splash";

/**
 * Output the help message with branded splash.
 *
 * This function is intended to be called when the user requests help or
 * when there is a parsing error.
 *
 * @param parsedYargs The yargs instance with the parsed arguments, used to
 * show help.
 * @param msg Optional error message to display after the help output.
 */
export const outputHelpWithSplash = (parsedYargs: Argv, msg?: string): void => {
    process.stdout.write(generateSplash());
    parsedYargs.showHelp();
    if (msg) {
        console.error(`\n ${msg}`);
    }
};
