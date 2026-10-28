import { afterEach, describe, expect, it, vi } from "vitest";

import { useStaff } from "~/composables/staff";

const MEMBER = {
  id: 1,
  name: "Jane Doe",
  role: "elder",
  summary: "Has served since 2010.",
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useStaff", () => {
  it("resolves the staff the site's API lists", async () => {
    const fetch = vi.fn(async () => [MEMBER]);
    vi.stubGlobal("$fetch", fetch);
    const { data } = await useStaff();
    expect(fetch).toHaveBeenCalledWith("/api/staff");
    expect(data.value).toEqual([MEMBER]);
  });

  it("resolves a list that is not staff to an empty one", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => [{ ...MEMBER, role: "Elder" }]),
    );
    const { data } = await useStaff();
    expect(data.value).toEqual([]);
  });

  it("resolves a list that cannot be read to an empty one", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => {
        throw new Error("database unavailable");
      }),
    );
    const { data } = await useStaff();
    expect(data.value).toEqual([]);
  });
});
