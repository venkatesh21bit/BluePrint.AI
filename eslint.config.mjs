import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next + keep lint from scanning generated output
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "eslint.config.*",
  ]),
]);

export default eslintConfig;
