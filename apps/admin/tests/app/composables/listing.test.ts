import { personListing } from "@bbf/schema";
import { describe, expect, it, vi } from "vitest";

import { createTable } from "#imports";
import { PERSON } from "#test/support/records";
import { withSetup } from "@bbf/nuxt/testing/mount";
import {
  useListingFetch,
  useListingRefresh,
  useTableRequest,
} from "~/composables/listing";
import { PEOPLE_TABLE } from "~/constants/people";

const PARAMS = {
  pagination: { pageIndex: 1, pageSize: 10 },
  sorting: [],
  query: "",
  filters: [],
};

describe("useListingFetch", () => {
  it("fetches the page the table asks for, and hands back its rows and their count", async () => {
    const fetch = vi.fn(async () => ({ items: [PERSON], total: 42 }));
    vi.stubGlobal("$fetch", fetch);
    const result = await useListingFetch("/api/people", personListing)(PARAMS);
    expect(fetch).toHaveBeenCalledWith("/api/people", {
      query: { page: 2, size: 10 },
    });
    expect(result).toEqual({ data: [PERSON], rowCount: 42 });
  });

  it("hands back the mark the page was read at with it", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => ({ items: [PERSON], total: 42, since: "7" })),
    );
    expect(await useListingFetch("/api/people", personListing)(PARAMS)).toEqual(
      { data: [PERSON], rowCount: 42, since: "7" },
    );
  });

  it("refuses an answer that is not the listing", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => ({ items: [{ name: "x" }], total: 1 })),
    );
    await expect(
      useListingFetch("/api/people", personListing)(PARAMS),
    ).rejects.toThrow();
  });
});

describe("useListingRefresh", () => {
  const poll = () =>
    useListingRefresh("/api/people", personListing)(
      { ...PARAMS, since: "7" },
      undefined as never,
    );

  it("asks for the page the table shows with the mark it was last read at, and hands back nothing where the API answers nothing", async () => {
    const fetch = vi.fn(async () => undefined);
    vi.stubGlobal("$fetch", fetch);
    expect(await poll()).toBe(null);
    expect(fetch).toHaveBeenCalledWith("/api/people", {
      query: { page: 2, size: 10, since: "7" },
    });
  });

  it("hands back the page as it now stands, with the mark to ask with next, where the list has changed", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => ({ items: [PERSON], total: 42, since: "8" })),
    );
    expect(await poll()).toEqual({ data: [PERSON], rowCount: 42, since: "8" });
  });

  it("refuses an answer that is not the listing", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => ({ items: [{ name: "x" }], total: 1 })),
    );
    await expect(poll()).rejects.toThrow();
  });
});

describe("useTableRequest", () => {
  it("fetches the table's page on every load, the first through its init", async () => {
    const fetch = vi.fn(async () => ({ data: [PERSON], rowCount: 1 }));
    const useTable = createTable("listing-request", { ...PEOPLE_TABLE, fetch });
    const table = withSetup(() => useTable()).result;
    expect(table.initialized).toBe(false);
    await useTableRequest(table);
    expect(table.initialized).toBe(true);
    expect(table.data).toEqual([PERSON]);
    expect(fetch).toHaveBeenCalledTimes(1);
    await useTableRequest(withSetup(() => useTable()).result);
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
