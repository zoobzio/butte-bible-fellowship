import { describe, expect, it } from "vitest";

import { paginate } from "~~/server/utils/listing";

const ITEMS = ["a", "b", "c", "d", "e"];

describe("paginate", () => {
  it("cuts the page the query asks for, and counts them all", () => {
    expect(paginate(ITEMS, { page: 1, size: 2 })).toEqual({
      items: ["a", "b"],
      total: 5,
    });
    expect(paginate(ITEMS, { page: 2, size: 2 })).toEqual({
      items: ["c", "d"],
      total: 5,
    });
    expect(paginate(ITEMS, { page: 3, size: 2 })).toEqual({
      items: ["e"],
      total: 5,
    });
  });

  it("holds nothing on a page past the end", () => {
    expect(paginate(ITEMS, { page: 4, size: 2 })).toEqual({
      items: [],
      total: 5,
    });
  });

  it("holds everything on a page big enough", () => {
    expect(paginate(ITEMS, { page: 1, size: 25 })).toEqual({
      items: ITEMS,
      total: 5,
    });
    expect(paginate([], { page: 1, size: 25 })).toEqual({
      items: [],
      total: 0,
    });
  });
});
