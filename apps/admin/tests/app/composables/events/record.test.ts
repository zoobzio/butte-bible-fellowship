import { describe, expect, it, vi } from "vitest";

import { DINNER } from "#test/support/records";
import { useEventRecord } from "~/composables/events/record";

describe("useEventRecord", () => {
  it("reads the event the route names from the admin's API", async () => {
    const fetch = vi.fn(async () => DINNER);
    vi.stubGlobal("$fetch", fetch);
    const { setRoutePath } = await import("#imports");
    setRoutePath("/events/4", { id: "4" });
    expect((await useEventRecord()).data.value).toEqual(DINNER);
    expect(fetch).toHaveBeenCalledWith("/api/events/4", {});
  });
});
