import { plainPackage } from "@bbf/toolbox/vitest/package";

export default plainPackage({
  test: {
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
