import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

export function nuxtApp(url: string) {
  const r = (p: string) => fileURLToPath(new URL(p, url));

  const root = pathToFileURL(
    createRequire(url).resolve("@bbf/nuxt/package.json"),
  );
  const layer = (p: string) => fileURLToPath(new URL(p, root));

  return defineConfig({
    plugins: [vue()],
    resolve: {
      alias: {
        "#imports": r("./tests/mocks/imports.ts"),
        "#app": r("./tests/mocks/imports.ts"),
        "#components": r("./tests/mocks/components.ts"),
        "#bezoar/service": layer("./testing/bezoar.ts"),
        "#layers/bbf": layer("."),
        "~": r("./app"),
        "~~": r("."),
        "#test": r("./tests"),
      },
    },
    test: {
      environment: "happy-dom",
      pool: "vmThreads",
      include: ["tests/**/*.test.ts"],
      fsModuleCache: true,
      setupFiles: ["tests/setup.ts"],
      coverage: {
        include: ["app/**/*.{ts,vue}", "server/**/*.ts"],
        reportsDirectory: ".coverage",
      },
    },
  });
}
