import { describe, expect, it } from "vitest";

import { TIME_ZONE } from "#layers/bbf/shared/constants/time";
import {
  recentDays,
  toFetchResult,
  toListingQuery,
  toTableDescriptors,
  withDays,
} from "~/utils/listing";

describe("recentDays", () => {
  it("counts back from the day it is at the church, today first, as YYYY-MM-DD", () => {
    // 06:30 UTC on the 2nd is still the evening of the 1st in Los Angeles.
    const now = new Date("2026-03-02T06:30:00Z");
    expect(recentDays(3, now)).toEqual([
      "2026-03-01",
      "2026-02-28",
      "2026-02-27",
    ]);
    expect(recentDays(1, new Date("2026-03-02T08:30:00Z"))).toEqual([
      "2026-03-02",
    ]);
  });

  it("steps over a daylight saving change a day at a time", () => {
    expect(recentDays(3, new Date("2026-03-09T20:00:00Z"))).toEqual([
      "2026-03-09",
      "2026-03-08",
      "2026-03-07",
    ]);
    expect(recentDays(0)).toEqual([]);
  });
});

describe("withDays", () => {
  it("hands the days to each date column's filter, and no other", () => {
    const config = withDays<{
      id: number;
      name: string;
      at: string;
      on: string;
    }>(
      {
        rowKey: "id",
        columns: [
          { key: "name", label: "admin.member.name" },
          { key: "at", label: "admin.editor.updated", type: "datetime" },
          { key: "on", label: "admin.event.date", type: "date" },
        ],
      },
      ["2026-10-28", "2026-10-27"],
    );
    expect(config.columns.map((column) => column.values)).toEqual([
      undefined,
      ["2026-10-28", "2026-10-27"],
      ["2026-10-28", "2026-10-27"],
    ]);
  });
});

describe("toTableDescriptors", () => {
  it("names each column and the search's text option, and formats every table in the church's time zone", () => {
    expect(
      toTableDescriptors<{ id: number; name: string }>(
        {
          rowKey: "id",
          columns: [{ key: "name", label: "admin.member.name" }],
        },
        (message) => `named:${message}`,
      ),
    ).toEqual({
      rowKey: "id",
      timeZone: TIME_ZONE,
      textLabel: "named:admin.editor.text",
      columns: [{ key: "name", label: "named:admin.member.name" }],
    });
  });
});

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

  it("names an operator filter by its column and its operator", () => {
    expect(
      toListingQuery({
        page: 1,
        pageSize: 25,
        sortField: null,
        sortDirection: "asc",
        query: "",
        filters: [
          { key: "updatedAt", op: "before", value: "2026-10-17" },
          { key: "createdAt", op: "on", value: "2026-10-01" },
        ],
      }),
    ).toEqual({
      page: 1,
      size: 25,
      updatedAtBefore: "2026-10-17",
      createdAtOn: "2026-10-01",
    });
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
