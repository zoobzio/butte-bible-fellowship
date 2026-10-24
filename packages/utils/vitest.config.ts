import { plainPackage } from "@bbf/toolbox/vitest/package";

export default plainPackage({
  test: {
    // The round trip boots a Postgres in memory before its first test.
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
