import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Allow unused variables that start with underscore
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "caughtErrorsIgnorePattern": "^_"
        }
      ],
      // Allow 'any' in specific patterns (can be tightened later)
      "@typescript-eslint/no-explicit-any": "warn",
      // Allow empty interfaces/objects for flexibility
      "@typescript-eslint/no-empty-object-type": "warn",
      "@typescript-eslint/no-unsafe-function-type": "warn",
      // Allow require() in config files
      "@typescript-eslint/no-require-imports": [
        "error",
        {
          "allow": ["tailwind.config.mjs", "postcss.config.mjs"]
        }
      ],
      // Allow unescaped entities in JSX
      "react/no-unescaped-entities": "warn",
      // Allow img elements (can be changed later to enforce next/image)
      "@next/next/no-img-element": "warn",
      // Allow anonymous default exports in config files
      "import/no-anonymous-default-export": [
        "error",
        {
          "allowObject": true
        }
      ]
    }
  }
];

export default eslintConfig;
