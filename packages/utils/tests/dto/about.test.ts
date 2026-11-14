import { aboutRecord, page } from "@bbf/schema";
import { describe, expect, it } from "vitest";

import { toAboutDocument, toAboutRecord } from "../../src/dto/about";

const BODY = {
  type: "root",
  children: [
    {
      type: "element",
      tagName: "h1",
      properties: {},
      children: [{ type: "text", value: "Our Vision" }],
    },
  ],
};

const ABOUT = { title: "About Us", description: "A clean canvas.", body: BODY };

const BARE = { ...ABOUT, description: null, body: null };

const STAMP = { updated_at: new Date("2026-10-18T09:30:00.000Z") };

describe("toAboutRecord", () => {
  it("is About Us as the admin reads it: every column, its date as text", () => {
    const record = toAboutRecord({ ...ABOUT, ...STAMP });
    expect(record).toEqual({
      title: "About Us",
      description: "A clean canvas.",
      body: BODY,
      updatedAt: "2026-10-18T09:30:00.000Z",
    });
    expect(aboutRecord.parse(record)).toEqual(record);
  });

  it("leaves out what the row has null in", () => {
    const record = toAboutRecord({ ...BARE, ...STAMP });
    expect(record.description).toBeUndefined();
    expect(record.body).toBeUndefined();
    expect(aboutRecord.safeParse(record).success).toBe(true);
  });

  it("refuses a body the schema would not accept", () => {
    expect(() => toAboutRecord({ ...BARE, ...STAMP, body: "# Hi" })).toThrow();
  });
});

describe("toAboutDocument", () => {
  it("is About Us as the site reads it: a page's own front matter, over what is written", () => {
    const document = toAboutDocument(ABOUT);
    expect(document.data.matter).toEqual({
      title: "About Us",
      description: "A clean canvas.",
    });
    expect(page.parse(document.data.matter)).toEqual(document.data.matter);
    expect(document.children).toMatchObject([
      { tagName: "h1", properties: { id: "our-vision" } },
    ]);
  });

  it("is its title alone when nothing else is written", () => {
    expect(toAboutDocument(BARE)).toEqual({
      type: "root",
      data: { matter: { title: "About Us" } },
      children: [],
    });
  });
});
