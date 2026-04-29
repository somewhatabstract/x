import {defineConfig} from "vitest/config";

export default defineConfig({
    test: {
        coverage: {
            include: ["src/**/*.ts"],
            exclude: ["scripts/pack-readme.mjs"],
            reporter: ["text", "json"],
        },
    },
});
