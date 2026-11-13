import { describe, expect, it, vi } from "vitest";

import { ABOUT } from "#test/support/records";
import { useContentRecord } from "~/composables/content/record";

describe("useContentRecord", () => {
  it("reads the page the route names from the admin's API", async () => {
    const fetch = vi.fn(async () => ABOUT);
    vi.stubGlobal("$fetch", fetch);
    const { setRoutePath } = await import("#imports");
    setRoutePath("/content/6", { id: "6" });
    expect((await useContentRecord()).data.value).toEqual(ABOUT);
    expect(fetch).toHaveBeenCalledWith("/api/content/6", {});
  });
});
