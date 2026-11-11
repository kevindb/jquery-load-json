import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import globals from "globals";

export default [
  {
    ignores: [
      ".jquery/**",
      ".vitest/**",
      "coverage/**",
      "dist/**",
      "examples/**",
      "test-results/**",
      "playwright-report/**",
    ],
  },
  js.configs.recommended,
  {
    files: ["src/**/*.js"],
    languageOptions: {
      sourceType: "module",
      globals: { ...globals.browser },
    },
    linterOptions: { reportUnusedDisableDirectives: "error" },
    rules: {
      "no-empty": ["error", { allowEmptyCatch: true }],
      "no-unused-vars": ["error", { args: "none", caughtErrors: "none" }],
      // Warnings, not errors, until the 1.x refactors remove them: var redeclared across switch
      // cases, assignments in the unreachable image branch, and the select options guard.
      "no-prototype-builtins": "warn",
      "no-redeclare": "warn",
      "no-useless-assignment": "warn",
    },
  },
  {
    files: [
      "test/suite/**/*.js",
      "test/setup.js",
      "test/jquery-esm.js",
      "test/surfaces/browser.test.js",
    ],
    languageOptions: {
      sourceType: "module",
      globals: { ...globals.browser, $: "readonly", jQuery: "readonly" },
    },
  },
  {
    files: [
      "*.config.mjs",
      "scripts/**/*.mjs",
      "test/surfaces/commonjs.test.js",
      "test/surfaces/manifests.test.js",
      "test/e2e/**/*.mjs",
    ],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    // page.evaluate callbacks run in the browser page, which has jQuery as $.
    files: ["test/e2e/**/*.spec.mjs"],
    languageOptions: { globals: { ...globals.node, ...globals.browser, $: "readonly" } },
  },
  prettier,
];
