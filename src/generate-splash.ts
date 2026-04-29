import {useColor} from "./use-color";

const rgb = (r: number, g: number, b: number) => (s: string) =>
    useColor() ? `\x1b[38;2;${r};${g};${b}m${s}\x1b[0m` : s;

const pink = rgb(255, 45, 149); // #ff2d95
const cyan = rgb(46, 230, 255); // #2ee6ff
const dim = rgb(154, 160, 180); // #9aa0b4

// Canonical 6-row ANSI Shadow forms for `>` and `x`, zipped row-by-row.
const caret = ["██╗  ", "╚██╗ ", " ╚██╗", " ██╔╝", "██╔╝ ", "╚═╝  "];
const ex = [
    "██╗  ██╗",
    "╚██╗██╔╝",
    " ╚███╔╝",
    " ██╔██╗",
    "██╔╝ ██╗",
    "╚═╝  ╚═╝",
];

/**
 * Generate a string that represents the splash screen.
 *
 * This includes the project logo, tagline, and usage hint, all styled with ANSI colors.
 * The output is designed to be printed to the console when the user runs the `x` command without arguments.
 *
 * @returns The formatted splash screen string.
 */
export function generateSplash(): string {
    const lines: string[] = [];

    // blank line for breathing room
    lines.push("");
    // glyph rows
    for (let i = 0; i < caret.length; i++) {
        lines.push(`      ${pink(caret[i])}${cyan(ex[i])}`);
    }
    lines.push("");

    // tagline — DISCOVER > EXECUTE > DONE
    lines.push(
        `${dim("DISCOVER ")}${pink(">")}${dim(" EXECUTE ")}${pink(">")}${dim(" DONE")}`,
    );
    lines.push(`${dim("─────────────────────────")}`);
    lines.push("");

    return `${lines.join("\n")}\n`;
}
