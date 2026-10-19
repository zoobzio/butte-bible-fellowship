import { staffListing } from "@bbf/schema";
import { describe, expect, it, vi } from "vitest";

import { STAFF } from "#test/support/records";
import { useListingFetch } from "~/composables/listing";

const PARAMS = {
  page: 2,
  pageSize: 10,
  sortField: null,
  sortDirection: "asc" as const,
  query: "",
  filters: [],
};

describe("useListingFetch", () => {
  it("fetches the page the table asks for, and hands back its rows and pages", async () => {
    const fetch = vi.fn(async () => ({ items: [STAFF], total: 42 }));
    vi.stubGlobal("$fetch", fetch);
    const result = await useListingFetch("/api/staff", staffListing)(PARAMS);
    expect(fetch).toHaveBeenCalledWith("/api/staff", {
      query: { page: 2, size: 10 },
    });
    expect(result).toEqual({ data: [STAFF], total: 42, pageCount: 5 });
  });

  it("refuses an answer that is not the listing", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => ({ items: [{ name: "x" }], total: 1 })),
    );
    await expect(
      useListingFetch("/api/staff", staffListing)(PARAMS),
    ).rejects.toThrow();
  });
});
