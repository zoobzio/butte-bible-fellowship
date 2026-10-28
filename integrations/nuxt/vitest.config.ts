import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath } from "node:url";

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // Nuxt virtual modules — shimmed for the no-Nuxt vitest environment.
      // The layer's own components reach only what the shared shims hold.
      "#imports": r("./testing/imports.ts"),
      "#components": r("./testing/components.ts"),
      "#bezoar/service": r("./testing/bezoar.ts"),
      // The layer by the names an app reaches it by — the named layer's
      // alias, as Nuxt adds it, and the package's own — so its tests read
      // as an app's do.
      "#layers/bbf": r("."),
      "@bbf/nuxt/testing": r("./testing"),
    },
  },
  test: {
    environment: "happy-dom",
    include: ["tests/**/*.test.ts"],
    // Keep transformed modules on disk between runs. The cache lives under
    // node_modules, so reinstalling dependencies clears it.
    fsModuleCache: true,
    setupFiles: ["tests/setup.ts"],
    coverage: {
      include: ["app/**/*.{ts,vue}", "server/**/*.ts", "testing/**/*.ts"],
      reportsDirectory: ".coverage",
    },
  },
});
