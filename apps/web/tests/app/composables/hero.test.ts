import { beforeEach, describe, expect, it } from "vitest";

import { setAppConfig } from "#imports";
import { useHeroHeading, useHeroImage } from "~/composables/hero";

const HERO = {
  heading: "Discover God’s **Love, Grace & Truth**",
  description: "Join us.",
  action: "Learn More",
  link: "/about-us",
};

beforeEach(() => {
  setAppConfig({ hero: { image: "/images/church.jpg" } });
});

describe("useHeroImage", () => {
  it("is the picture uploaded for the hero", () => {
    const hero = { ...HERO, image: "https://cdn.example.com/home/1.jpg" };
    expect(useHeroImage(() => hero).value).toBe(
      "https://cdn.example.com/home/1.jpg",
    );
  });

  it("is the site's own picture while none is uploaded", () => {
    expect(useHeroImage(() => HERO).value).toBe("/images/church.jpg");
  });
});

describe("useHeroHeading", () => {
  it("is the heading in the parts it is drawn in, the highlight marked", () => {
    expect(useHeroHeading(() => HERO).value).toEqual([
      { text: "Discover God’s ", highlight: false },
      { text: "Love, Grace & Truth", highlight: true },
    ]);
  });
});
