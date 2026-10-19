import { describe, expect, it, vi } from "vitest";

import { useApi } from "~/composables/api";

describe("useApi", () => {
  it("is the app's fetch, by path, with what the request carries", async () => {
    const fetch = vi.fn(async () => ({ ok: true }));
    vi.stubGlobal("$fetch", fetch);
    const api = useApi();
    expect(await api("/api/staff", { method: "POST", body: { a: 1 } })).toEqual(
      { ok: true },
    );
    expect(fetch).toHaveBeenCalledWith("/api/staff", {
      method: "POST",
      body: { a: 1 },
    });
    await api("/api/staff/1");
    expect(fetch).toHaveBeenLastCalledWith("/api/staff/1", {});
  });
});
