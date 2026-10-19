import { describe, expect, it } from "vitest";

import { toFetchResult, toListingQuery } from "~/utils/listing";

describe("toListingQuery", () => {
  it("asks for the page and size the table is on", () => {
    expect(
      toListingQuery({
        page: 3,
        pageSize: 10,
        sortField: null,
        sortDirection: "asc",
        query: "",
        filters: [],
      }),
    ).toEqual({ page: 3, size: 10 });
  });
});

describe("toFetchResult", () => {
  it("hands the table its rows, the total and the pages at the size asked", () => {
    expect(toFetchResult({ items: ["a", "b"], total: 42 }, 10)).toEqual({
      data: ["a", "b"],
      total: 42,
      pageCount: 5,
    });
  });

  it("counts an empty list as one page", () => {
    expect(toFetchResult({ items: [], total: 0 }, 25)).toEqual({
      data: [],
      total: 0,
      pageCount: 1,
    });
  });
});
