import { describe, expect, it, vi } from "vitest";

import { STAFF } from "#test/support/records";
import { useStaffRecord } from "~/composables/staff/record";

describe("useStaffRecord", () => {
  it("reads the member the route names from the admin's API", async () => {
    const fetch = vi.fn(async () => STAFF);
    vi.stubGlobal("$fetch", fetch);
    const { setRoutePath } = await import("#imports");
    setRoutePath("/staff/1", { id: "1" });
    expect((await useStaffRecord()).data.value).toEqual(STAFF);
    expect(fetch).toHaveBeenCalledWith("/api/staff/1", {});
  });
});
