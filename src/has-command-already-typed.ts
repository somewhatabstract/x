/**
 * Determine whether a command is typed in in the completion context.
 *
 * @param rawArgs The raw command line arguments passed to x, including the
 * "--get-yargs-completions" flag and any partial command the user has typed.
 * @returns True if there are already typed words that look like a command,
 * false if the user is still typing the command or if the completion flag is
 * not present.
 */
export function hasCommandAlreadyTyped(rawArgs: string[]): boolean {
    const completionIndex = rawArgs.indexOf("--get-yargs-completions");
    if (completionIndex === -1) {
        return false;
    }
    // After flag: [program-name, ...typed-words, current-partial]
    // Drop program-name (first) and current-partial (last) to get
    // already-committed words
    const typedWords = rawArgs.slice(completionIndex + 2, -1);
    return typedWords.some((word) => !word.startsWith("-"));
}
