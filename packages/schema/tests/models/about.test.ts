import { describe, expect, it } from "vitest";

import { aboutRecord } from "../../src/models/about";

const BODY = {
  type: "root",
  children: [
    {
      type: "element",
      tagName: "h2",
      properties: {},
      children: [{ type: "text", value: "Our Vision" }],
    },
  ],
};

const BARE = { title: "About Us", updatedAt: "2026-10-18T09:30:00.000Z" };

const ABOUT = { ...BARE, description: "A clean canvas.", body: BODY };

describe("aboutRecord", () => {
  it("accepts the page with all it can say", () => {
    expect(aboutRecord.parse(ABOUT)).toEqual(ABOUT);
  });

  it("accepts it with a title and nothing more", () => {
    expect(aboutRecord.parse(BARE)).toEqual(BARE);
  });

  it("needs a title and when it was changed", () => {
    for (const key of Object.keys(BARE)) {
      const { [key]: _, ...rest } = BARE as Record<string, unknown>;
      expect(aboutRecord.safeParse(rest).success, key).toBe(false);
    }
  });

  it("is one row, opened by its title and description: it carries neither an id, a slug nor a heading of its own", () => {
    expect(
      aboutRecord.parse({ ...BARE, id: 1, slug: "about-us", heading: "Us" }),
    ).toEqual(BARE);
  });

  it("rejects a body that is not a tree", () => {
    expect(aboutRecord.safeParse({ ...BARE, body: "# Hello" }).success).toBe(
      false,
    );
  });
});
