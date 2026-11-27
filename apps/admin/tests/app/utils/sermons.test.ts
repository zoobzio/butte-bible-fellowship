import { describe, expect, it } from "vitest";

import { FAITH } from "#test/support/records";
import { toBatchQuery, toFetchResult, toPreached } from "~/utils/sermons";

describe("toBatchQuery", () => {
  it("asks for the first batch with how many alone", () => {
    expect(
      toBatchQuery({ cursor: null, limit: 30, query: "", filters: [] }),
    ).toEqual({ limit: 30 });
  });

  it("carries the cursor, the free text as q, and each filter under the key the API names it by", () => {
    expect(
      toBatchQuery({
        cursor: "2026-10-04.12",
        limit: 10,
        query: "faith",
        filters: [
          { key: "status", op: "not", value: "archived" },
          { key: "title", op: "starts with", value: "Faith" },
          { key: "date", op: "on or before", value: "2026-10-31" },
        ],
      }),
    ).toEqual({
      limit: 10,
      cursor: "2026-10-04.12",
      q: "faith",
      statusNot: "archived",
      titleStartsWith: "Faith",
      dateOnOrBefore: "2026-10-31",
    });
  });
});

describe("toFetchResult", () => {
  it("reads a batch as the timeline takes it, with its mark where it has one", () => {
    expect(
      toFetchResult({ items: [FAITH], cursor: "2026-10-04.12", since: "7" }),
    ).toEqual({ data: [FAITH], cursor: "2026-10-04.12", since: "7" });
    expect(toFetchResult({ items: [], cursor: null })).toEqual({
      data: [],
      cursor: null,
    });
  });
});

describe("toPreached", () => {
  it("writes the day as the locale does, the same day whatever the time zone", () => {
    expect(toPreached("2026-10-04", "en-US")).toBe("October 4, 2026");
    expect(toPreached("2026-01-01", "en-US")).toBe("January 1, 2026");
    expect(toPreached("2026-10-04", "es")).toBe("4 de octubre de 2026");
  });
});
