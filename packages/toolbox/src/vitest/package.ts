import { defineConfig, mergeConfig, type ViteUserConfig } from "vitest/config";

/**
 * The vitest config a plain TypeScript package tests with: Node, and the
 * tests under tests/. A package passes what it needs on top.
 */
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
