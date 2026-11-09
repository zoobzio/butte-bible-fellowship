import { describe, expect, it, vi } from "vitest";

import {
  param,
  toDaySearch,
  toListing,
  toTextSearch,
} from "~~/server/utils/listing";

describe("param", () => {
  it("joins an operator's words with underscores, as the SQL names its parameter", () => {
    expect(param("is")).toBe("is");
    expect(param("not contains")).toBe("not_contains");
    expect(param("on or before")).toBe("on_or_before");
  });
});

describe("toTextSearch", () => {
  const COLUMNS = ["name", "email"] as const;

  it("names every operator of every column, null for each left out", () => {
    expect(toTextSearch(COLUMNS, {})).toEqual({
      name_contains: null,
      name_not_contains: null,
      name_starts_with: null,
      name_ends_with: null,
      name_is: null,
      name_not: null,
      email_contains: null,
      email_not_contains: null,
      email_starts_with: null,
      email_ends_with: null,
      email_is: null,
      email_not: null,
    });
  });

  it("carries each filter the query holds under the SQL's name for it", () => {
    expect(
      toTextSearch(COLUMNS, {
        nameContains: "jane",
        nameNotContains: "roe",
        emailIs: "missing",
        emailEndsWith: ".org",
      }),
    ).toMatchObject({
      name_contains: "jane",
      name_not_contains: "roe",
      name_is: null,
      email_is: "missing",
      email_ends_with: ".org",
      email_starts_with: null,
    });
  });

  it("names nothing for no column", () => {
    expect(toTextSearch([], {})).toEqual({});
  });
});

describe("toDaySearch", () => {
  const COLUMNS = { date: "date", updated: "updatedAt" } as const;

  it("names every operator of every column as the SQL does, null for each left out", () => {
    expect(toDaySearch(COLUMNS, {})).toEqual({
      date_before: null,
      date_after: null,
      date_on: null,
      date_on_or_after: null,
      date_on_or_before: null,
      updated_before: null,
      updated_after: null,
      updated_on: null,
      updated_on_or_after: null,
      updated_on_or_before: null,
    });
  });

  it("reads each filter under the key the query gives the column", () => {
    expect(
      toDaySearch(COLUMNS, {
        dateOn: "2026-12-24",
        updatedAtOnOrAfter: "2026-10-02",
        updatedAtBefore: "2026-10-17",
      }),
    ).toMatchObject({
      date_on: "2026-12-24",
      date_before: null,
      updated_on_or_after: "2026-10-02",
      updated_before: "2026-10-17",
    });
  });
});

describe("toListing", () => {
  const ROWS = ["a", "b", "c", "d", "e"];

  /* A window of the rows, each carrying how many there are in all. */
  const read = vi.fn(
    async ({ size, offset }: { size: number; offset: number }) =>
      ROWS.slice(offset, offset + size).map((name) => ({
        name,
        total: ROWS.length,
      })),
  );
  const none = vi.fn(async () => [] as { name: string; total: number }[]);
  const item = (row: { name: string }) => row.name.toUpperCase();

  it("asks for the window the query names, and counts by the rows it carries", async () => {
    read.mockClear();
    expect(await toListing({ page: 2, size: 2 }, read, item)).toEqual({
      items: ["C", "D"],
      total: 5,
    });
    expect(read).toHaveBeenCalledTimes(1);
    expect(read).toHaveBeenCalledWith({ size: 2, offset: 2 });
  });

  it("asks the first row for the count when the page is past the end", async () => {
    read.mockClear();
    expect(await toListing({ page: 4, size: 2 }, read, item)).toEqual({
      items: [],
      total: 5,
    });
    expect(read).toHaveBeenCalledTimes(2);
    expect(read).toHaveBeenLastCalledWith({ size: 1, offset: 0 });
  });

  it("counts nothing when the search finds nothing, asking once for the first page", async () => {
    expect(await toListing({ page: 1, size: 25 }, none, item)).toEqual({
      items: [],
      total: 0,
    });
    expect(none).toHaveBeenCalledTimes(1);
    expect(await toListing({ page: 3, size: 25 }, none, item)).toEqual({
      items: [],
      total: 0,
    });
    expect(none).toHaveBeenCalledTimes(3);
  });
});
