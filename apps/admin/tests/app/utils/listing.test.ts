import { describe, expect, it } from "vitest";

import { toFetchResult, toListingQuery } from "~/utils/listing";

describe("toListingQuery", () => {
  it("asks for the page the table is on, counted from one, at its size", () => {
    expect(
      toListingQuery({
        pagination: { pageIndex: 2, pageSize: 10 },
        sorting: [],
        query: "",
        filters: [],
      }),
    ).toEqual({ page: 3, size: 10 });
  });

  it("carries the free text as q, and each committed column filter under its key", () => {
    expect(
      toListingQuery({
        pagination: { pageIndex: 0, pageSize: 25 },
        sorting: [],
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
        pagination: { pageIndex: 0, pageSize: 25 },
        sorting: [{ id: "updatedAt", desc: true }],
        query: "",
        filters: [],
      }),
    ).toEqual({ page: 1, size: 25, sort: "updatedAt", direction: "desc" });
  });

  it("asks for the first of the table's sorts alone, as the API sorts by one column", () => {
    expect(
      toListingQuery({
        pagination: { pageIndex: 0, pageSize: 25 },
        sorting: [
          { id: "role", desc: false },
          { id: "name", desc: true },
        ],
        query: "",
        filters: [],
      }),
    ).toEqual({ page: 1, size: 25, sort: "role", direction: "asc" });
  });

  it("names an operator filter by its column and its operator, each word of it capitalised", () => {
    expect(
      toListingQuery({
        pagination: { pageIndex: 0, pageSize: 25 },
        sorting: [],
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
        pagination: { pageIndex: 0, pageSize: 25 },
        sorting: [],
        query: "",
        filters: [{ key: "name", op: "between", value: "a" }],
      }),
    ).toThrow('"between" is not an operator the schema names.');
  });
});

describe("toFetchResult", () => {
  it("hands the table its rows and how many the whole search holds", () => {
    expect(toFetchResult({ items: ["a", "b"], total: 42 })).toEqual({
      data: ["a", "b"],
      rowCount: 42,
    });
  });

  it("hands on an empty list as no rows of none", () => {
    expect(toFetchResult({ items: [], total: 0 })).toEqual({
      data: [],
      rowCount: 0,
    });
  });
});
