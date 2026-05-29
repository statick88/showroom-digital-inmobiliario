import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import security from "eslint-plugin-security";
import prettier from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...tseslint.configs.recommended,
  {
    plugins: {
      "react-hooks": reactHooks,
      security,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...security.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  prettier,
  globalIgnores(["out/**", "build/**", "node_modules/**"]),
]);

export default eslintConfig;
