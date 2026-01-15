import {codecovRollupPlugin} from "@codecov/rollup-plugin";
import {defineConfig} from "tsdown";

export default defineConfig({
    entry: ["./src/bin/x.ts"],
    platform: "node",
    sourcemap: false,
    dts: {
        oxc: true,
        tsconfig: "tsconfig-types.json"
    },
    plugins: [
        process.env.CODECOV_TOKEN
            ? // This plugin provides bundle analysis from codecov, but does
              // not work locally without additional config, and it does not
              // output size info to the console.
              codecovRollupPlugin({
                  enableBundleAnalysis: true, // true when CODECOV_TOKEN set
                  bundleName: "x",
                  uploadToken: process.env.CODECOV_TOKEN,
              })
            : undefined,
    ],
});
