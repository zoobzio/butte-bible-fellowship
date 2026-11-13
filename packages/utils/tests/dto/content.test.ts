import { contentRecord, page } from "@bbf/schema";
import { describe, expect, it } from "vitest";

import { toContentDocument, toContentRecord } from "../../src/dto/content";

const heading = (tagName: string, value: string, properties = {}) => ({
  type: "element",
  tagName,
  properties,
  children: [{ type: "text", value }],
});

const BODY = {
  type: "root",
  children: [
    heading("h1", "Our Vision"),
    {
      type: "element",
      tagName: "div",
      properties: { dataDirective: "invite-card" },
      children: [heading("h3", "New to Chico?")],
    },
    heading("h2", "Our Vision"),
  ],
};

const HOME = {
  slug: "index",
  title: "Butte Bible Fellowship",
  description: "A local church.",
  body: BODY,
};

const BARE = {
  slug: "membership",
  title: "Membership",
  description: null,
  body: null,
};

const STAMPS = {
  id: 4,
  created_at: new Date("2026-10-17T18:00:00.000Z"),
  updated_at: new Date("2026-10-18T09:30:00.000Z"),
};

describe("toContentRecord", () => {
  it("is a page as the admin reads it: every column, its dates as text", () => {
    const record = toContentRecord({ ...HOME, ...STAMPS });
    expect(record).toEqual({
      id: 4,
      slug: "index",
      title: "Butte Bible Fellowship",
      description: "A local church.",
      body: BODY,
      createdAt: "2026-10-17T18:00:00.000Z",
      updatedAt: "2026-10-18T09:30:00.000Z",
    });
    expect(contentRecord.parse(record)).toEqual(record);
  });

  it("leaves out what a row has null in", () => {
    const record = toContentRecord({ ...BARE, ...STAMPS });
    expect(record.description).toBeUndefined();
    expect(record.body).toBeUndefined();
    expect(contentRecord.safeParse(record).success).toBe(true);
  });

  it("refuses a body the schema would not accept", () => {
    expect(() =>
      toContentRecord({ ...BARE, ...STAMPS, body: "# Hello" }),
    ).toThrow();
  });
});

describe("toContentDocument", () => {
  it("is a page as the site reads it: its front matter over what is written", () => {
    const document = toContentDocument(HOME);
    expect(document.type).toBe("root");
    expect(document.data.matter).toEqual({
      title: "Butte Bible Fellowship",
      description: "A local church.",
    });
    expect(page.parse(document.data.matter)).toEqual(document.data.matter);
    expect(document.children).toHaveLength(3);
  });

  it("gives every heading an id, for a page's table of contents, each its own", () => {
    const [first, card, second] = toContentDocument(HOME).children;
    expect(first).toMatchObject({ properties: { id: "our-vision" } });
    expect(second).toMatchObject({ properties: { id: "our-vision-1" } });
    expect(card).toMatchObject({
      properties: { dataDirective: "invite-card" },
      children: [{ tagName: "h3", properties: { id: "new-to-chico" } }],
    });
  });

  it("starts the ids over for each page, and leaves the row as it was", () => {
    toContentDocument(HOME);
    expect(toContentDocument(HOME).children[0]).toMatchObject({
      properties: { id: "our-vision" },
    });
    expect(BODY.children[0]!.properties).toEqual({});
  });

  it("is an empty document for a page nothing is written on", () => {
    expect(toContentDocument(BARE)).toEqual({
      type: "root",
      data: { matter: { title: "Membership" } },
      children: [],
    });
  });
});
