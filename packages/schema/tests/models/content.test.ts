import { describe, expect, it } from "vitest";

import {
  ARTICLE_MIME,
  contentRecord,
  contentRecords,
  mime,
} from "../../src/models/content";

const BODY = {
  type: "root",
  children: [
    {
      type: "element",
      tagName: "div",
      properties: { dataDirective: "invite-card" },
      children: [
        {
          type: "element",
          tagName: "p",
          properties: {},
          children: [{ type: "text", value: "You’re invited." }],
        },
      ],
    },
  ],
};

const HOME = {
  id: 1,
  mime: ARTICLE_MIME,
  slug: "index",
  title: "Butte Bible Fellowship",
  description: "A non-denominational local church.",
  body: BODY,
  size: 2048,
  createdAt: "2026-10-17T18:00:00.000Z",
  updatedAt: "2026-10-18T09:30:00.000Z",
};

const BARE = {
  id: 2,
  mime: ARTICLE_MIME,
  slug: "sermons",
  title: "Sermons",
  size: 0,
  createdAt: "2026-10-17T18:00:00.000Z",
  updatedAt: "2026-10-17T18:00:00.000Z",
};

describe("mime", () => {
  it("is a media type as a document is served: lowercase, a type over a subtype, no parameters", () => {
    for (const type of [
      ARTICLE_MIME,
      "image/png",
      "image/svg+xml",
      "application/pdf",
      "application/vnd.ms-excel",
      "font/woff2",
    ]) {
      expect(mime.parse(type), type).toBe(type);
    }
    for (const type of [
      "",
      "pdf",
      "image/",
      "/png",
      "Image/PNG",
      "image/png; q=1",
      "image / png",
    ]) {
      expect(mime.safeParse(type).success, type).toBe(false);
    }
  });

  it("names an article as the site's own type", () => {
    expect(ARTICLE_MIME).toBe("application/vnd.bbf.article+json");
  });
});

describe("contentRecord", () => {
  it("accepts a page with all it can say, the site's blocks in its body", () => {
    expect(contentRecord.parse(HOME)).toEqual(HOME);
  });

  it("accepts a page with a title and nothing written", () => {
    expect(contentRecord.parse(BARE)).toEqual(BARE);
  });

  it("needs an id, a media type, a slug, a title, a size and its dates", () => {
    for (const key of [
      "id",
      "mime",
      "slug",
      "title",
      "size",
      "createdAt",
      "updatedAt",
    ]) {
      const { [key]: _, ...rest } = BARE as Record<string, unknown>;
      expect(contentRecord.safeParse(rest).success, key).toBe(false);
    }
  });

  it("is of any media type, and holds whole bytes, none at the least", () => {
    expect(contentRecord.parse({ ...BARE, mime: "image/png" }).mime).toBe(
      "image/png",
    );
    expect(contentRecord.safeParse({ ...BARE, mime: "image" }).success).toBe(
      false,
    );
    expect(contentRecord.safeParse({ ...BARE, size: -1 }).success).toBe(false);
    expect(contentRecord.safeParse({ ...BARE, size: 1.5 }).success).toBe(false);
  });

  it("rejects a slug that would not do in an address", () => {
    expect(contentRecord.safeParse({ ...BARE, slug: "About Us" }).success).toBe(
      false,
    );
    expect(
      contentRecord.safeParse({ ...BARE, slug: "events/extra" }).success,
    ).toBe(false);
  });

  it("rejects a body that is not a tree, and carries no hero", () => {
    expect(contentRecord.safeParse({ ...BARE, body: "# Hello" }).success).toBe(
      false,
    );
    expect(
      contentRecord.parse({ ...BARE, hero: { tagline: "Welcome" } }),
    ).toEqual(BARE);
  });
});

describe("contentRecords", () => {
  it("is the pages of one folder, each a record, the folder it is filed in with it", () => {
    const filed = [{ ...HOME, folder: 3 }, BARE];
    expect(contentRecords.parse(filed)).toEqual(filed);
    expect(contentRecords.parse([])).toEqual([]);
    expect(contentRecords.safeParse([{ id: 1 }]).success).toBe(false);
    expect(contentRecords.safeParse([{ ...BARE, folder: 0 }]).success).toBe(
      false,
    );
  });
});
