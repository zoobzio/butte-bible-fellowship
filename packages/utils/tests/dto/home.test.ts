import { homePage, homeRecord } from "@bbf/schema";
import { describe, expect, it } from "vitest";

import { toHomeDocument, toHomeRecord } from "../../src/dto/home";

const BODY = {
  type: "root",
  children: [
    {
      type: "element",
      tagName: "h2",
      properties: {},
      children: [{ type: "text", value: "Welcome" }],
    },
  ],
};

const HEADING = "Discover God’s **Love, Grace & Truth**";

const HOME = {
  title: "Butte Bible Fellowship",
  description: "A local church.",
  hero_heading: HEADING,
  hero_description: "Join us.",
  hero_action: "Learn More",
  hero_link: "/about-us",
  hero_image: "https://cdn.example.com/home/1.jpg",
  body: BODY,
};

const BARE = { ...HOME, description: null, hero_image: null, body: null };

const STAMP = { updated_at: new Date("2026-10-18T09:30:00.000Z") };

const HERO = {
  heading: HEADING,
  description: "Join us.",
  action: "Learn More",
  link: "/about-us",
};

describe("toHomeRecord", () => {
  it("is the home page as the admin reads it: every column, its date as text", () => {
    const record = toHomeRecord({ ...HOME, ...STAMP });
    expect(record).toEqual({
      title: "Butte Bible Fellowship",
      description: "A local church.",
      heroHeading: HEADING,
      heroDescription: "Join us.",
      heroAction: "Learn More",
      heroLink: "/about-us",
      heroImage: "https://cdn.example.com/home/1.jpg",
      body: BODY,
      updatedAt: "2026-10-18T09:30:00.000Z",
    });
    expect(homeRecord.parse(record)).toEqual(record);
  });

  it("leaves out what the row has null in: its description, its picture, its body", () => {
    const record = toHomeRecord({ ...BARE, ...STAMP });
    expect(record.description).toBeUndefined();
    expect(record.heroImage).toBeUndefined();
    expect(record.body).toBeUndefined();
    expect(homeRecord.safeParse(record).success).toBe(true);
  });

  it("refuses a body the schema would not accept", () => {
    expect(() => toHomeRecord({ ...BARE, ...STAMP, body: "# Hi" })).toThrow();
  });
});

describe("toHomeDocument", () => {
  it("is the home page as the site reads it: its hero in its front matter, over what is written", () => {
    const document = toHomeDocument(HOME);
    expect(document.data.matter).toEqual({
      title: "Butte Bible Fellowship",
      description: "A local church.",
      hero: { ...HERO, image: "https://cdn.example.com/home/1.jpg" },
    });
    expect(homePage.parse(document.data.matter)).toEqual(document.data.matter);
    expect(document.children).toMatchObject([
      { tagName: "h2", properties: { id: "welcome" } },
    ]);
  });

  it("is its front matter alone when nothing is written, its hero with no picture of its own", () => {
    expect(toHomeDocument(BARE)).toEqual({
      type: "root",
      data: { matter: { title: "Butte Bible Fellowship", hero: HERO } },
      children: [],
    });
  });
});
