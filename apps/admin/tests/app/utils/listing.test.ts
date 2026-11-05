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

  it("carries the free text as q, and each committed column filter under its key", () => {
    expect(
      toListingQuery({
        page: 1,
        pageSize: 25,
        sortField: null,
        sortDirection: "asc",
        query: "jane",
        filters: [
          { key: "role", value: "elder" },
          { key: "status", value: "published" },
        ],
      }),
    ).toEqual({
      page: 1,
      size: 25,
      q: "jane",
      role: "elder",
      status: "published",
    });
  });

  it("carries the sort as its column and its direction, once a column is sorted", () => {
    expect(
      toListingQuery({
        page: 1,
        pageSize: 25,
        sortField: "updatedAt",
        sortDirection: "desc",
        query: "",
        filters: [],
      }),
    ).toEqual({ page: 1, size: 25, sort: "updatedAt", direction: "desc" });
  });

  it("names an operator filter by its column and its operator, each word of it capitalised", () => {
    expect(
      toListingQuery({
        page: 1,
        pageSize: 25,
        sortField: null,
        sortDirection: "asc",
        query: "",
        filters: [
          { key: "updatedAt", op: "before", value: "2026-10-17" },
          { key: "createdAt", op: "on or after", value: "2026-10-01" },
          { key: "name", op: "not contains", value: "doe" },
          { key: "email", op: "starts with", value: "jane" },
        ],
      }),
    ).toEqual({
      page: 1,
      size: 25,
      updatedAtBefore: "2026-10-17",
      createdAtOnOrAfter: "2026-10-01",
      nameNotContains: "doe",
      emailStartsWith: "jane",
    });
  });

  it("refuses an operator the schema does not name", () => {
    expect(() =>
      toListingQuery({
        page: 1,
        pageSize: 25,
        sortField: null,
        sortDirection: "asc",
        query: "",
        filters: [{ key: "name", op: "between", value: "a" }],
      }),
    ).toThrow('"between" is not an operator the schema names.');
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
