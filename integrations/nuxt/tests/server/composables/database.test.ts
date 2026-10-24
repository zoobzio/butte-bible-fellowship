import { describe, expect, it } from "vitest";

import { service, useBezoar } from "@bbf/nuxt/testing/bezoar";
import { useDatabase } from "#layers/bbf/server/composables/database";

describe("useDatabase", () => {
  it("is the database service the module keeps, the same on every call", () => {
    const first = useDatabase();
    const second = useDatabase();
    expect(first).toBe(service);
    expect(second).toBe(first);
    expect(useBezoar).toHaveBeenCalledTimes(2);
  });
});
