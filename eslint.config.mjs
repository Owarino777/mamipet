import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextCoreWebVitals,
  {
    ignores: [".next/**", ".next-qa/**", "node_modules/**", "coverage/**"],
  },
];

export default eslintConfig;
