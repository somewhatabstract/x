/**
 * Determine if a bin file should be invoked via the Node executable,
 * based on its file extension (case-insensitive).
 * Matches npm's behavior for .js, .mjs, and .cjs files.
 *
 * @param binPath - The path to the bin file
 * @returns True if the file should be invoked via node
 */
export function isNodeExecutable(binPath: string): boolean {
    const lower = binPath.toLowerCase();
    return (
        lower.endsWith(".js") ||
        lower.endsWith(".mjs") ||
        lower.endsWith(".cjs")
    );
}
