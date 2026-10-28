import { describe, expect, it } from "vitest";

import { TIME_ZONE } from "#layers/bbf/shared/constants/time";
import {
  toFetchResult,
  toListingQuery,
  toTableDescriptors,
} from "~/utils/listing";

describe("toTableDescriptors", () => {
  it("names each column and formats every table in the church's time zone", () => {
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
