import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: {
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
    },
  },
});

const eslintConfig = [
  ...compat.extends("eslint:recommended"),
];

export default eslintConfig;
