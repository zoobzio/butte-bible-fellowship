import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath } from "node:url";

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "#imports": r("./testing/imports.ts"),
      "#components": r("./testing/components.ts"),
      "#bezoar/service": r("./testing/bezoar.ts"),
      "#layers/bbf": r("."),
      "@bbf/nuxt/testing": r("./testing"),
    },
  },
  test: {
    environment: "happy-dom",
    include: ["tests/**/*.test.ts"],
    fsModuleCache: true,
    setupFiles: ["tests/setup.ts"],
    coverage: {
      include: ["app/**/*.{ts,vue}", "server/**/*.ts", "testing/**/*.ts"],
      reportsDirectory: ".coverage",
    },
  },
});
