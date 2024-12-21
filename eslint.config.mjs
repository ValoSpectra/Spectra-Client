import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  { rules: { "@typescript-eslint/no-explicit-any": "off" } },
  { rules: { "@typescript-eslint/no-require-imports": "off" } },
  { rules: { "no-case-declarations": "off" } },
  { rules: { "no-fallthrough": "off" } },
  prettier,
];
