import { describe, expect, it } from "vitest";

import {
  SERMON_BATCH_MAX,
  SERMON_CURSOR,
  SERMONS_LIMIT,
  sermonBatchQuery,
  sermonBody,
  sermonForm,
  sermonId,
  sermonPath,
  sermonsQuery,
} from "../../src/input/sermon";

describe("sermonPath", () => {
  it("names a sermon by the slug of its page", () => {
    expect(sermonPath.parse({ slug: "faith-and-works" })).toEqual({
      slug: "faith-and-works",
    });
    expect(sermonPath.safeParse({ slug: "Faith Works" }).success).toBe(false);
    expect(sermonPath.safeParse({ id: "abc123" }).success).toBe(false);
  });
});

describe("sermonsQuery", () => {
  it("takes fifteen when not told how many", () => {
    expect(sermonsQuery.parse({})).toEqual({ limit: 15 });
  });

  it("reads the limit from the query's string", () => {
    expect(sermonsQuery.parse({ limit: "3" })).toEqual({ limit: 3 });
  });

  it("rejects a limit that is not a whole number within reach", () => {
    expect(sermonsQuery.safeParse({ limit: "0" }).success).toBe(false);
    expect(sermonsQuery.safeParse({ limit: "2.5" }).success).toBe(false);
    expect(sermonsQuery.safeParse({ limit: "many" }).success).toBe(false);
    expect(
      sermonsQuery.safeParse({ limit: String(SERMONS_LIMIT + 1) }).success,
    ).toBe(false);
  });
});

describe("sermonBody", () => {
  const BODY = {
    slug: "faith-and-works",
    title: "Faith & Works",
    date: "2026-10-04",
  };

  it("takes a slug, a title and a date, and is published until told otherwise", () => {
    expect(sermonBody.parse(BODY)).toEqual({ ...BODY, status: "published" });
  });

  it("carries every field a sermon is written with", () => {
    const full = {
      ...BODY,
      speaker: "Pastor Name",
      summary: "James 2, and what faith does.",
      body: "## James 2\n\nWhat faith does.",
      image: "https://cdn.example.com/sermons/faith-and-works.jpg",
      video: "dQw4w9WgXcQ",
      status: "published",
    };
    expect(sermonBody.parse(full)).toEqual(full);
  });

  it("takes the body as Markdown, not as a tree", () => {
    expect(
      sermonBody.safeParse({ ...BODY, body: { type: "root", children: [] } })
        .success,
    ).toBe(false);
  });

  it("rejects what is not a sermon", () => {
    expect(sermonBody.safeParse({ ...BODY, title: "" }).success).toBe(false);
    expect(sermonBody.safeParse({ ...BODY, date: undefined }).success).toBe(
      false,
    );
    expect(sermonBody.safeParse({ ...BODY, date: "October 4" }).success).toBe(
      false,
    );
    expect(sermonBody.safeParse({ ...BODY, video: "" }).success).toBe(false);
    expect(sermonBody.safeParse({ ...BODY, status: "hidden" }).success).toBe(
      false,
    );
  });
});

describe("sermonId", () => {
  it("reads a sermon's number from its address", () => {
    expect(sermonId.parse({ id: "12" })).toEqual({ id: 12 });
    expect(sermonId.safeParse({ id: "0" }).success).toBe(false);
    expect(sermonId.safeParse({ id: "faith-and-works" }).success).toBe(false);
  });
});

describe("sermonForm", () => {
  it("holds a sermon's details, and not what is written about it", () => {
    const details = {
      slug: "faith-and-works",
      title: "Faith & Works",
      speaker: "Pastor Name",
      video: "dQw4w9WgXcQ",
      date: "2026-10-04",
      status: "published",
    };
    expect(sermonForm.parse({ ...details, body: "## James 2" })).toEqual(
      details,
    );
    expect(Object.keys(sermonForm.shape)).not.toContain("body");
  });
});

describe("sermonBatchQuery", () => {
  it("asks for the first thirty when told nothing", () => {
    expect(sermonBatchQuery.parse({})).toEqual({ limit: 30 });
  });

  it("carries the cursor a batch ended with, the limit and the mark", () => {
    expect(
      sermonBatchQuery.parse({
        cursor: "2026-10-04.12",
        limit: "10",
        since: "42",
      }),
    ).toEqual({ cursor: "2026-10-04.12", limit: 10, since: "42" });
    expect(SERMON_CURSOR.exec("2026-10-04.12")?.slice(1)).toEqual([
      "2026-10-04",
      "12",
    ]);
  });

  it("carries the search: the free text, trimmed, and a filter on the status, each text column and the day preached", () => {
    const search = {
      q: "faith",
      statusIs: "draft",
      statusNot: "archived",
      titleStartsWith: "Faith",
      speakerIs: "missing",
      summaryNotContains: "James",
      dateOnOrAfter: "2026-10-01",
      dateBefore: "2026-11-01",
    };
    expect(sermonBatchQuery.parse({ ...search, q: " faith " })).toEqual({
      ...search,
      limit: 30,
    });
  });

  it("rejects a status that is none, and a day that is not one", () => {
    expect(sermonBatchQuery.safeParse({ statusIs: "live" }).success).toBe(
      false,
    );
    expect(sermonBatchQuery.safeParse({ dateOn: "October" }).success).toBe(
      false,
    );
  });

  it("rejects a cursor that is none of a batch's, and a limit out of reach", () => {
    for (const cursor of ["12", "2026-10-04", "2026-10-04.0", "2026-10-04.x"]) {
      expect(sermonBatchQuery.safeParse({ cursor }).success, cursor).toBe(
        false,
      );
    }
    expect(sermonBatchQuery.safeParse({ limit: "0" }).success).toBe(false);
    expect(
      sermonBatchQuery.safeParse({ limit: String(SERMON_BATCH_MAX + 1) })
        .success,
    ).toBe(false);
  });
});
