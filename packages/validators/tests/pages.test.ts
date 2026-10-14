import { describe, expect, it } from "vitest";

import { hero, page } from "../src/pages";

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
  it("accepts a page with no front matter of its own", () => {
    expect(page.parse({})).toEqual({});
  });

  it("accepts the events page's calendar", () => {
    const value = {
      events: [{ title: "Worship Service", day: "sunday", start: "10:00" }],
    };
    expect(page.parse(value)).toEqual(value);
  });

  it("accepts the contact page's staff", () => {
    const value = { staff: [{ name: "Jane Doe", role: "Elder" }] };
    expect(page.parse(value)).toEqual(value);
  });

  it("rejects a staff member without a role", () => {
    expect(page.safeParse({ staff: [{ name: "Jane Doe" }] }).success).toBe(
      false,
    );
  });
});
