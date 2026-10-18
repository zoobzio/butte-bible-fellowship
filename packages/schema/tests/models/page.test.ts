import { describe, expect, it } from "vitest";

import { hero, page } from "../../src/models/page";

describe("hero", () => {
  it("needs only a tagline", () => {
    expect(hero.parse({ tagline: "Welcome" })).toEqual({ tagline: "Welcome" });
  });

  it("carries a call to action with a label and a destination", () => {
    const value = {
      tagline: "Welcome",
      cta: { label: "Visit", to: "/connect" },
    };
    expect(hero.parse(value)).toEqual(value);
    expect(
      hero.safeParse({ tagline: "Welcome", cta: { label: "Visit" } }).success,
    ).toBe(false);
  });
});

describe("page", () => {
  it("needs only a title", () => {
    expect(page.parse({ title: "Home" })).toEqual({ title: "Home" });
    expect(page.safeParse({}).success).toBe(false);
  });

  it("accepts the events page's calendar", () => {
    const value = {
      title: "Events",
      events: [{ title: "Worship Service", day: "sunday", start: "10:00" }],
    };
    expect(page.parse(value)).toEqual(value);
  });

  it("carries no staff: the site reads them from its API", () => {
    expect(
      page.parse({ title: "Connect", staff: [{ name: "Jane Doe" }] }),
    ).toEqual({ title: "Connect" });
  });
});
