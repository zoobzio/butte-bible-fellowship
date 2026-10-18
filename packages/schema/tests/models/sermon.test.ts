import { describe, expect, it } from "vitest";

import { sermon, sermons } from "../../src/models/sermon";

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
