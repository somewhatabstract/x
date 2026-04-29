/**
 * Rewrite or restore README.md asset paths for npm publishing.
 *
 * When packing the npm tarball, relative asset paths are rewritten to
 * absolute GitHub raw URLs so images render correctly on the npm registry
 * without shipping the asset files. The original README is backed up and
 * restored after packing.
 *
 * Usage:
 *   node scripts/pack-readme.mjs rewrite   # called by prepack
 *   node scripts/pack-readme.mjs restore   # called by postpack
 */

import { copyFileSync, existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";

const BASE_URL =
    "https://raw.githubusercontent.com/somewhatabstract/x/main/";
const BACKUP = "README.md.bak";
const README = "README.md";

const mode = process.argv[2];

if (mode === "rewrite") {
    copyFileSync(README, BACKUP);
    const content = readFileSync(README, "utf8");
    // Replace both `./assets/` and bare `assets/` references in src/srcset attributes
    const rewritten = content.replace(
        /(?:\.\/)?assets\//g,
        `${BASE_URL}assets/`,
    );
    writeFileSync(README, rewritten, "utf8");
    console.log("README.md: rewrote asset paths for publishing.");
} else if (mode === "restore") {
    if (existsSync(BACKUP)) {
        copyFileSync(BACKUP, README);
        unlinkSync(BACKUP);
        console.log("README.md: restored original asset paths.");
    }
} else {
    console.error(`Usage: pack-readme.mjs <rewrite|restore>`);
    process.exit(1);
}
