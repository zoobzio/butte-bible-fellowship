import { describe, expect, it } from "vitest";

import { contentListing, contentRecord } from "../../src/models/content";

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
  slug: "index",
  title: "Butte Bible Fellowship",
  description: "A non-denominational local church.",
  body: BODY,
  createdAt: "2026-10-17T18:00:00.000Z",
  updatedAt: "2026-10-18T09:30:00.000Z",
};

const BARE = {
  id: 2,
  slug: "sermons",
  title: "Sermons",
  createdAt: "2026-10-17T18:00:00.000Z",
  updatedAt: "2026-10-17T18:00:00.000Z",
};

describe("contentRecord", () => {
  it("accepts a page with all it can say, the site's blocks in its body", () => {
    expect(contentRecord.parse(HOME)).toEqual(HOME);
  });

  it("accepts a page with a title and nothing written", () => {
    expect(contentRecord.parse(BARE)).toEqual(BARE);
  });

  it("needs an id, a slug, a title and its dates", () => {
    for (const key of ["id", "slug", "title", "createdAt", "updatedAt"]) {
      const { [key]: _, ...rest } = BARE as Record<string, unknown>;
      expect(contentRecord.safeParse(rest).success, key).toBe(false);
    }
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

describe("contentListing", () => {
  it("is a page of records and the count of them all", () => {
    const listing = { items: [HOME, BARE], total: 12 };
    expect(contentListing.parse(listing)).toEqual(listing);
    expect(contentListing.safeParse({ items: [HOME] }).success).toBe(false);
  });
});
