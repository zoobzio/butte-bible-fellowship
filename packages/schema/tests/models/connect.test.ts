import { describe, expect, it } from "vitest";

import { connectPage, connectRecord } from "../../src/models/connect";

const BODY = {
  type: "root",
  children: [
    {
      type: "element",
      tagName: "p",
      properties: {},
      children: [{ type: "text", value: "Come and see." }],
    },
  ],
};

const MATTER = {
  title: "Connect",
  address: "2255 Pillsbury Road, Chico, California 95926",
};

const REACH = {
  description: "We’d love to meet you.",
  phone: "530-892-0521",
  fax: "530-898-1851",
  email: "office@bbfchurchchico.org",
  hours: "Tuesday–Thursday: 9am–4pm\nFriday: 9am–noon",
};

const BARE = { ...MATTER, updatedAt: "2026-10-18T09:30:00.000Z" };

const CONNECT = { ...BARE, ...REACH, body: BODY };

describe("connectPage", () => {
  it("is the page's front matter as the site reads it: its header, and how to find and reach the church", () => {
    const matter = { ...MATTER, ...REACH };
    expect(connectPage.parse(matter)).toEqual(matter);
  });

  it("needs a title and an address, and nothing more", () => {
    expect(connectPage.parse(MATTER)).toEqual(MATTER);
    for (const key of Object.keys(MATTER)) {
      const { [key]: _, ...rest } = MATTER as Record<string, unknown>;
      expect(connectPage.safeParse(rest).success, key).toBe(false);
    }
  });

  it("carries no picture, as an event's page does, and no map of its own", () => {
    expect(
      connectPage.parse({ ...MATTER, image: "/a.jpg", map: "https://x.test" }),
    ).toEqual(MATTER);
  });
});

describe("connectRecord", () => {
  it("accepts the page with all it can say", () => {
    expect(connectRecord.parse(CONNECT)).toEqual(CONNECT);
  });

  it("accepts it with a title and an address and nothing more", () => {
    expect(connectRecord.parse(BARE)).toEqual(BARE);
  });

  it("needs a title, an address and when it was changed", () => {
    for (const key of Object.keys(BARE)) {
      const { [key]: _, ...rest } = BARE as Record<string, unknown>;
      expect(connectRecord.safeParse(rest).success, key).toBe(false);
    }
  });

  it("is one row: it carries neither an id nor a slug", () => {
    expect(connectRecord.parse({ ...BARE, id: 1, slug: "connect" })).toEqual(
      BARE,
    );
  });

  it("rejects a body that is not a tree", () => {
    expect(connectRecord.safeParse({ ...BARE, body: "# Hello" }).success).toBe(
      false,
    );
  });
});
