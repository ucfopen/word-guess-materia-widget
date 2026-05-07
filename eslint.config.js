import globals from "globals";
import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["build/"]),
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      globals: {
        ...globals.browser,
        ...globals.node,
        Materia: "readonly",
      },
    },
    rules: {
      "array-callback-return": "error",
      "no-duplicate-imports": "error",
      "no-self-compare": "error",
      "no-template-curly-in-string": "error",
      "no-unreachable-loop": "error",
      "no-use-before-define": "error",
      "require-atomic-updates": "error",

      "arrow-body-style": ["error", "as-needed"],
      camelcase: [
        "error",
        {
          properties: "never",
          ignoreDestructuring: true,
          ignoreImports: true,
        },
      ],
      "capitalized-comments": [
        "error",
        "always",
        {
          ignoreInlineComments: true,
          ignoreConsecutiveComments: true,
        },
      ],
      curly: ["error", "multi-or-nest"],
      "default-case": "error",
      "default-case-last": "error",
      "dot-notation": "error",
      eqeqeq: ["error", "always"],
      "no-extend-native": "error",
      "no-extra-boolean-cast": "error",
      "no-implicit-coercion": "error",
      "no-implied-eval": "error",
      "no-invalid-this": "error",
      "no-labels": "error",
      "no-lonely-if": "error",
      "no-multi-assign": [
        "error",
        {
          ignoreNonDeclaration: true,
        },
      ],
      "no-multi-str": "error",
      "no-nested-ternary": "error",
      "no-new-func": "error",
      "no-new-wrappers": "error",
      "no-object-constructor": "error",
      "no-param-reassign": "error",
      "no-return-assign": ["error", "always"],
      "no-script-url": "error",
      "no-shadow": "error",
      "no-throw-literal": "error",
      "no-unneeded-ternary": "error",
      "no-useless-constructor": "error",
      "no-useless-rename": "error",
      "no-useless-return": "error",
      "no-var": "error",
      "no-void": "error",
      "operator-assignment": ["error", "always"],
      "prefer-arrow-callback": "error",
      "prefer-const": "error",
      "prefer-promise-reject-errors": "error",
      "prefer-template": "error",
      radix: "error",
      "require-await": "error",
      "sort-imports": [
        "error",
        {
          allowSeparatedGroups: true,
        },
      ],
      yoda: ["error", "never"],
      "no-magic-numbers": [
        "warn",
        {
          ignore: [-1, 0, 1],
          ignoreArrayIndexes: true,
          ignoreDefaultValues: true,
          ignoreClassFieldInitialValues: true,
          enforceConst: true,
          detectObjects: false,
        },
      ],
      "no-inline-comments": "warn",
      "no-warning-comments": [
        "warn",
        {
          terms: ["todo", "fixme"],
          location: "start",
        },
      ],
      "no-unused-vars": [
        "warn",
        {
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
]);
