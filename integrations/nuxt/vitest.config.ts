import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      // Nuxt virtual modules — shimmed for the no-Nuxt vitest environment.
      "#bezoar/service": r("./testing/bezoar.ts"),
      // The layer by the names an app reaches it by — the named layer's
      // alias, as Nuxt adds it, and the package's own — so its tests read
      // as an app's do.
      "#layers/bbf": r("."),
      "@bbf/nuxt/testing": r("./testing"),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    coverage: {
      include: ["server/**/*.ts", "testing/**/*.ts"],
      reportsDirectory: ".coverage",
    },
  },
});
