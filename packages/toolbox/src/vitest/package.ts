import { defineConfig, mergeConfig, type ViteUserConfig } from "vitest/config";

export function plainPackage(overrides: ViteUserConfig = {}) {
  return mergeConfig(
    defineConfig({
      test: {
        environment: "node",
        include: ["tests/**/*.test.ts"],
      },
    }),
    overrides,
  );
}
