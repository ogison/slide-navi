import nextConfig from "eslint-config-next";
import prettierConfig from "eslint-config-prettier";

const eslintConfig = [
  ...nextConfig,
  prettierConfig,
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "public/**"],
  },
  {
    rules: {
      // These new React 19 rules need codebase updates - disabled for now
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
    },
  },
];

export default eslintConfig;
