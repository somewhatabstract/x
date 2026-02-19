import eslintComments from "eslint-plugin-eslint-comments";
import _import from "eslint-plugin-import";
import prettier from "eslint-plugin-prettier";
import {fixupPluginRules} from "@eslint/compat";
import globals from "globals";
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
    {
        ignores: [
            "**/node_modules",
            "**/coverage",
            "**/dist",
            ".prettierrc.js",
        ],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        plugins: {
            "eslint-comments": eslintComments,
            import: fixupPluginRules(_import),
            prettier,
        },

        languageOptions: {
            globals: {
                ...globals.node,
            },
        },
    },
    {
        files: ["src/**/*.ts", "**/__tests__/**/*.ts"],
        rules: {
            curly: "error",
            eqeqeq: ["error", "allow-null"],
            "guard-for-in": "error",
            "linebreak-style": ["error", "unix"],
            "no-alert": "error",
            "no-array-constructor": "error",
            "no-console": "error",
            "no-debugger": "error",
            "no-extra-bind": "error",
            "no-new": "error",
            "no-new-func": "error",
            "no-new-object": "error",
            "no-throw-literal": "error",
            "no-with": "error",
            "no-async-promise-executor": "error",

            "no-else-return": [
                "error",
                {
                    allowElseIf: false,
                },
            ],

            "no-irregular-whitespace": "off",
            "no-multi-str": "error",
            "no-prototype-builtins": "off",
            "no-return-await": "error",
            "no-useless-catch": "off",
            "no-useless-call": "error",
            "no-unexpected-multiline": "error",
            "no-unused-expressions": "error",
            "no-var": "error",
            "one-var": ["error", "never"],
            "prefer-const": "error",
            "prefer-spread": "error",
            "require-await": "error",
            "require-yield": "error",
            "prefer-template": "off",
            "arrow-parens": "off",
            "prefer-arrow-callback": "off",
            "no-case-declarations": "off",
            "valid-jsdoc": "off",
            "require-jsdoc": "off",
            "eslint-comments/no-unlimited-disable": "error",
            "eslint-comments/no-unused-disable": "error",

            "import/extensions": [
                "error",
                "never",
                {
                    ignorePackages: true,
                    pattern: {
                        json: "always",
                    },
                },
            ],

            "import/no-cycle": [
                "error",
                {
                    ignoreExternal: true,
                    commonjs: true,
                    maxDepth: 6,
                },
            ],

            "import/named": "error",

            // NOTE: These two rules are turned off as they don't work with
            // the new flat config file that ESLint 9 requires.
            // https://github.com/import-js/eslint-plugin-import/issues/2556
            "import/default": "off",
            "import/namespace": "off",

            "prettier/prettier": [
                "error",
                {
                    tabWidth: 4,
                    trailingComma: "all",
                    bracketSpacing: false,
                },
            ],
        },
    },
);
