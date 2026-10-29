import { describe, expect, it } from "vitest";

import {
  LISTING_DEFAULT_SIZE,
  LISTING_MAX_SIZE,
  listingQuery,
} from "../../src/input/listing";

describe("listingQuery", () => {
  it("is the first page of twenty-five when it names nothing", () => {
    expect(LISTING_DEFAULT_SIZE).toBe(25);
    expect(listingQuery.parse({})).toEqual({ page: 1, size: 25 });
  });

  it("reads the page and the size a query string carries", () => {
    expect(listingQuery.parse({ page: "3", size: "10" })).toEqual({
      page: 3,
      size: 10,
    });
  });

  it("carries the free text trimmed, or none", () => {
    expect(listingQuery.parse({ q: "  jane " }).q).toBe("jane");
    expect(listingQuery.parse({ q: "" }).q).toBe("");
    expect(listingQuery.parse({})).not.toHaveProperty("q");
  });

  it("counts pages from one", () => {
    expect(listingQuery.safeParse({ page: "0" }).success).toBe(false);
    expect(listingQuery.safeParse({ page: "1.5" }).success).toBe(false);
    expect(listingQuery.safeParse({ page: "two" }).success).toBe(false);
  });

  it("holds a page to at most a hundred items", () => {
    expect(LISTING_MAX_SIZE).toBe(100);
    expect(listingQuery.parse({ size: "100" }).size).toBe(100);
    expect(listingQuery.safeParse({ size: "101" }).success).toBe(false);
    expect(listingQuery.safeParse({ size: "0" }).success).toBe(false);
  });
});
