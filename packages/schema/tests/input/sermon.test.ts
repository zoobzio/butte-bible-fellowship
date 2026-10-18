import { describe, expect, it } from "vitest";

import {
  SERMONS_LIMIT,
  sermonBody,
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

  it("takes a slug, a title and a date, and is a draft until told otherwise", () => {
    expect(sermonBody.parse(BODY)).toEqual({ ...BODY, status: "draft" });
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
