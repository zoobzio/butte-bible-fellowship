import { describe, expect, it } from "vitest";

import { homeHero, homePage, homeRecord } from "../../src/models/home";

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

/** One line: what stands between asterisks is what the site highlights. */
const HEADING = "Discover God’s **Love, Grace & Truth**";

const HERO = {
  heading: HEADING,
  description: "Join us.",
  action: "Learn More",
  link: "/about-us",
};

const BARE = {
  title: "Butte Bible Fellowship",
  heroHeading: HEADING,
  heroDescription: HERO.description,
  heroAction: HERO.action,
  heroLink: HERO.link,
  updatedAt: "2026-10-18T09:30:00.000Z",
};

const HOME = {
  ...BARE,
  description: "A non-denominational local church.",
  heroImage: "https://cdn.example.com/home/1.jpg",
  body: BODY,
};

describe("homeHero", () => {
  it("is what the home page opens with: its heading, its words, and where its button leads", () => {
    expect(homeHero.parse(HERO)).toEqual(HERO);
    for (const key of Object.keys(HERO)) {
      const { [key]: _, ...rest } = HERO as Record<string, unknown>;
      expect(homeHero.safeParse(rest).success, key).toBe(false);
    }
  });

  it("takes a heading that is a line of text, its highlight marked in it, and no tree", () => {
    expect(homeHero.parse(HERO).heading).toBe(
      "Discover God’s **Love, Grace & Truth**",
    );
    expect(
      homeHero.safeParse({ ...HERO, heading: { type: "root", children: [] } })
        .success,
    ).toBe(false);
  });

  it("shows the picture uploaded for it, when there is one", () => {
    const pictured = { ...HERO, image: "https://cdn.example.com/home/1.jpg" };
    expect(homeHero.parse(pictured)).toEqual(pictured);
  });

  it("leads its button to a link", () => {
    expect(homeHero.safeParse({ ...HERO, link: "about-us" }).success).toBe(
      false,
    );
  });
});

describe("homePage", () => {
  it("is the home page's front matter: a title, a description and its hero", () => {
    const matter = { title: "Home", description: "A church.", hero: HERO };
    expect(homePage.parse(matter)).toEqual(matter);
    expect(homePage.parse({ title: "Home", hero: HERO })).toEqual({
      title: "Home",
      hero: HERO,
    });
  });

  it("needs a title and a hero, and carries no picture but its hero's", () => {
    expect(homePage.safeParse({ hero: HERO }).success).toBe(false);
    expect(homePage.safeParse({ title: "Home" }).success).toBe(false);
    expect(
      homePage.parse({ title: "Home", hero: HERO, image: "/a.jpg" }),
    ).toEqual({ title: "Home", hero: HERO });
  });
});

describe("homeRecord", () => {
  it("accepts the home page with all it can say, the site's blocks in its body", () => {
    expect(homeRecord.parse(HOME)).toEqual(HOME);
  });

  it("accepts it with no description, no picture and nothing written", () => {
    expect(homeRecord.parse(BARE)).toEqual(BARE);
  });

  it("needs a title, the words of the hero and when it was changed", () => {
    for (const key of Object.keys(BARE)) {
      const { [key]: _, ...rest } = BARE as Record<string, unknown>;
      expect(homeRecord.safeParse(rest).success, key).toBe(false);
    }
  });

  it("is one row: it carries neither an id nor a slug, and one heading, not two lines", () => {
    expect(
      homeRecord.parse({
        ...BARE,
        id: 1,
        slug: "index",
        heroTagline: "Discover",
        heroHighlight: "Love",
      }),
    ).toEqual(BARE);
  });

  it("rejects a body that is not a tree", () => {
    expect(homeRecord.safeParse({ ...BARE, body: "# Hello" }).success).toBe(
      false,
    );
  });
});
