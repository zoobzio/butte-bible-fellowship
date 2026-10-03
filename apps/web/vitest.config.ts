import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath } from "node:url";

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // Nuxt virtual modules — shimmed for the no-Nuxt vitest environment.
      "#imports": r("./tests/mocks/imports.ts"),
      "#app": r("./tests/mocks/imports.ts"),
      "#components": r("./tests/mocks/components.ts"),
      // App source alias mirrors Nuxt's "~" → project root.
      "~": r("./app"),
      // Test-only support (mocks, mount factories).
      "#test": r("./tests"),
    },
  },
  test: {
    environment: "happy-dom",
    // One happy-dom per worker instead of per file; each file still runs in
    // its own VM context, so tests stay isolated from one another.
    pool: "vmThreads",
    include: ["tests/**/*.test.ts"],
    // Keep transformed modules on disk between runs. The cache lives under
    // node_modules, so reinstalling dependencies clears it.
    fsModuleCache: true,
    setupFiles: ["tests/setup.ts"],
    coverage: {
      include: ["app/**/*.{ts,vue}"],
      reportsDirectory: ".coverage",
    },
  },
});
