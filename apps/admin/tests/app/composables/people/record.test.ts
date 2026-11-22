import { describe, expect, it, vi } from "vitest";

import { PERSON } from "#test/support/records";
import { usePersonRecord } from "~/composables/people/record";

describe("usePersonRecord", () => {
  it("reads the person the route names from the admin's API", async () => {
    const fetch = vi.fn(async () => PERSON);
    vi.stubGlobal("$fetch", fetch);
    const { setRoutePath } = await import("#imports");
    setRoutePath("/people/1", { id: "1" });
    expect((await usePersonRecord()).data.value).toEqual(PERSON);
    expect(fetch).toHaveBeenCalledWith("/api/people/1", {});
  });
});
