import { staffListing } from "@bbf/schema";
import { describe, expect, it, vi } from "vitest";

import { createTable } from "#imports";
import { STAFF } from "#test/support/records";
import { withSetup } from "@bbf/nuxt/testing/mount";
import { useListingFetch, useTableRequest } from "~/composables/listing";
import { STAFF_TABLE } from "~/constants/staff";

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

describe("useTableRequest", () => {
  it("fetches the table's first page on load, and only once", async () => {
    const fetch = vi.fn(async () => ({
      data: [STAFF],
      total: 1,
      pageCount: 1,
    }));
    const useTable = createTable("listing-request", { ...STAFF_TABLE, fetch });
    const table = withSetup(() => useTable()).result;
    expect(table.initialized).toBe(false);
    await useTableRequest(table);
    expect(table.initialized).toBe(true);
    expect(table.data).toEqual([STAFF]);
    expect(fetch).toHaveBeenCalledTimes(1);
    await useTableRequest(withSetup(() => useTable()).result);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
