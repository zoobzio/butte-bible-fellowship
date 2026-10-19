import { describe, expect, it } from "vitest";
import { z } from "zod";

import { listing } from "../../src/models/listing";

const names = listing(z.object({ name: z.string() }));

describe("listing", () => {
  it("is a page of items and how many there are in all", () => {
    const page = { items: [{ name: "Jane" }], total: 42 };
    expect(names.parse(page)).toEqual(page);
  });

  it("may be an empty page of none", () => {
    expect(names.parse({ items: [], total: 0 })).toEqual({
      items: [],
      total: 0,
    });
  });

  it("checks each item against what it is", () => {
    expect(names.safeParse({ items: [{ name: 1 }], total: 1 }).success).toBe(
      false,
    );
  });

  it("rejects a total that is not a whole number from zero", () => {
    expect(names.safeParse({ items: [], total: -1 }).success).toBe(false);
    expect(names.safeParse({ items: [], total: 1.5 }).success).toBe(false);
    expect(names.safeParse({ items: [] }).success).toBe(false);
  });
});
