import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

export default [
  {
    ignores: [".next/**", "node_modules/**"],
  },
  ...nextCoreWebVitals,
  {
    rules: {
      // Keep this warning behavior consistent with the previous .eslintrc.json.
      "no-unused-vars": "warn",

      // Next 16's new React Hooks rules are useful but currently too noisy for this codebase.
      // Keep them visible while not blocking `npm run lint`.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
    },
  },
];
