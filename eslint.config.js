import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import prettierConfig from "eslint-config-prettier/flat";
import prettierPlugin from "eslint-plugin-prettier";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";

export default [
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsparser,
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.node,
    },
    plugins: {
      "@typescript-eslint": tseslint,
      prettier: prettierPlugin,
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...prettierConfig.rules,
      "@typescript-eslint/no-unused-vars": "warn",
      "no-console": "warn",
      "prettier/prettier": "error",
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            ["\\u0000$"], // type imports
            ["^node:", "^[^@.]"], // packages
            ["^@"], // path aliases
            ["^\\."], // relative imports
          ],
        },
      ],
      "simple-import-sort/exports": "error",
    },
  },
  {
    ignores: ["dist/**"],
  },
];
