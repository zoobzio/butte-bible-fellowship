import { createConfigForNuxt } from "@nuxt/eslint-config/flat";

export default createConfigForNuxt({
  features: {
    tooling: true,
    stylistic: false,
    typescript: true,
  },
}).append(
  {
    ignores: [
      "**/node_modules/**",
      "**/.nuxt/**",
      "**/.output/**",
      "**/.data/**",
      "**/dist/**",
      "legacy/**",
    ],
  },
  {
    rules: {
      // Allow single-word component names (App*, page-level components).
      "vue/multi-word-component-names": "off",
      // Vue 3 allows multiple root elements.
      "vue/no-multiple-template-root": "off",
      // Optional props without defaults are fine.
      "vue/require-default-prop": "off",
      // Allow @ts-ignore for runtime module imports.
      "@typescript-eslint/ban-ts-comment": "off",
      // Allow {} in type aliases for empty props/emits.
      "@typescript-eslint/no-empty-object-type": ["error", { allowObjectTypes: "always" }],
    },
  },
);
