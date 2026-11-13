import { describe, expect, it } from "vitest";

import { page } from "../../src/models/page";

describe("page", () => {
  it("needs only a title", () => {
    expect(page.parse({ title: "Home" })).toEqual({ title: "Home" });
    expect(page.safeParse({}).success).toBe(false);
  });

  it("carries no hero: the home page's is the interface's own", () => {
    expect(page.parse({ title: "Home", hero: { tagline: "Welcome" } })).toEqual(
      { title: "Home" },
    );
  });

  it("carries no calendar: the site reads the events from its API", () => {
    expect(
      page.parse({ title: "Events", events: [{ title: "Worship Service" }] }),
    ).toEqual({ title: "Events" });
  });

  it("carries no staff: the site reads them from its API", () => {
    expect(
      page.parse({ title: "Connect", staff: [{ name: "Jane Doe" }] }),
    ).toEqual({ title: "Connect" });
  });
});
