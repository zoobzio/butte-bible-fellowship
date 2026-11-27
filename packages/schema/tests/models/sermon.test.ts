import { describe, expect, it } from "vitest";

import {
  sermon,
  sermonBatch,
  sermonDetail,
  sermonRecord,
  sermonSync,
  sermons,
} from "../../src/models/sermon";

const SERMON = {
  slug: "faith-and-works",
  title: "Faith & Works",
  speaker: "Pastor Name",
  summary: "James 2, and what faith does.",
  image: "https://cdn.example.com/sermons/faith-and-works.jpg",
  video: "dQw4w9WgXcQ",
  date: "2026-10-04",
};

const BODY = {
  type: "root",
  children: [
    {
      type: "element",
      tagName: "p",
      properties: {},
      children: [{ type: "text", value: "What faith does." }],
    },
  ],
};

describe("sermon", () => {
  it("accepts a sermon as the API serves it", () => {
    expect(sermon.parse(SERMON)).toEqual(SERMON);
  });

  it("needs only a slug, a title and a date", () => {
    const { slug, title, date } = SERMON;
    expect(sermon.parse({ slug, title, date })).toEqual({ slug, title, date });
  });

  it("carries what is written about it as the tree the app renders", () => {
    expect(sermon.parse({ ...SERMON, body: BODY }).body).toEqual(BODY);
    expect(sermon.safeParse({ ...SERMON, body: "**Markdown**" }).success).toBe(
      false,
    );
  });

  it("rejects a slug that is not one", () => {
    expect(sermon.safeParse({ ...SERMON, slug: "Faith Works" }).success).toBe(
      false,
    );
  });

  it("rejects a date that is not a day", () => {
    expect(
      sermon.safeParse({ ...SERMON, date: "2026-10-04T18:16:28Z" }).success,
    ).toBe(false);
    expect(sermon.safeParse({ ...SERMON, date: undefined }).success).toBe(
      false,
    );
  });

  it("rejects an empty video, and an image that is not a URL", () => {
    expect(sermon.safeParse({ ...SERMON, video: "" }).success).toBe(false);
    expect(
      sermon.safeParse({ ...SERMON, image: "faith-and-works.jpg" }).success,
    ).toBe(false);
  });
});

describe("sermons", () => {
  it("accepts a list, and an empty one", () => {
    expect(sermons.parse([SERMON])).toEqual([SERMON]);
    expect(sermons.parse([])).toEqual([]);
  });

  it("rejects what is not a list", () => {
    expect(sermons.safeParse({ sermons: [SERMON] }).success).toBe(false);
  });
});

const RECORD = {
  id: 12,
  ...SERMON,
  status: "draft",
  createdAt: "2026-10-17T18:00:00.000Z",
  updatedAt: "2026-10-18T09:30:00.000Z",
};

describe("sermonRecord", () => {
  it("accepts a sermon as the admin lists it, whether or not it reaches the site", () => {
    expect(sermonRecord.parse(RECORD)).toEqual(RECORD);
    expect(sermonRecord.safeParse({ ...RECORD, status: "live" }).success).toBe(
      false,
    );
    expect(sermonRecord.safeParse(SERMON).success).toBe(false);
  });

  it("leaves out what is written about it", () => {
    expect(sermonRecord.parse({ ...RECORD, body: BODY })).toEqual(RECORD);
  });
});

describe("sermonDetail", () => {
  it("accepts a sermon as the admin reads it on its own page, what is written about it as Markdown", () => {
    const detail = { ...RECORD, body: "## James 2\n\nWhat faith does." };
    expect(sermonDetail.parse(detail)).toEqual(detail);
    expect(sermonDetail.parse(RECORD)).toEqual(RECORD);
    expect(sermonDetail.safeParse({ ...RECORD, body: BODY }).success).toBe(
      false,
    );
  });
});

describe("sermonBatch", () => {
  it("carries the sermons, the way to the batch after them and the mark they were read at", () => {
    const batch = { items: [RECORD], cursor: "2026-10-04.12", since: "42" };
    expect(sermonBatch.parse(batch)).toEqual(batch);
    expect(sermonBatch.parse({ items: [], cursor: null })).toEqual({
      items: [],
      cursor: null,
    });
    expect(sermonBatch.safeParse({ items: [] }).success).toBe(false);
  });
});

describe("sermonSync", () => {
  it("counts the recordings found and the sermons added", () => {
    expect(sermonSync.parse({ found: 15, added: 2 })).toEqual({
      found: 15,
      added: 2,
    });
    expect(sermonSync.safeParse({ found: 15, added: -1 }).success).toBe(false);
    expect(sermonSync.safeParse({ found: 15 }).success).toBe(false);
  });
});
