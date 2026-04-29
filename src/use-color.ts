/**
 * Determine whether to use ANSI color codes or not.
 *
 * This function checks the following environment variables in order:
 *
 *   1. `NO_COLOR`: If set to any value, color will be disabled.
 *   2. `FORCE_COLOR`: If set to any value (and `NO_COLOR` is not set), color
 *      will be enabled.
 *   3. If neither variable is set, it checks if the standard output is a TTY
 *      (terminal). If it is, color will be enabled; otherwise, it will be
 *      disabled.
 *
 * This logic allows users to control color output through environment
 * variables, while also providing a sensible default based on the output
 * context.
 *
 * @returns `true` if ANSI color codes should be used, `false` otherwise.
 */
export const useColor = () =>
    process.env.NO_COLOR
        ? false
        : process.env.FORCE_COLOR
          ? true
          : process.stdout.isTTY === true;
