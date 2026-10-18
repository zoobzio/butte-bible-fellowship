import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    // The round trip boots a Postgres in memory before its first test.
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
