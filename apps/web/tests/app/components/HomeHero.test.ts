import { beforeEach, describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

import { setAppConfig, setLocale } from "#imports";
import HomeHero from "~/components/HomeHero.vue";

const HEADING = "Discover God’s **Love, Grace & Truth**";

const HERO = {
  heading: HEADING,
  description: "Join us in the pursuit of His character.",
  action: "Learn More",
  link: "/about-us",
};

beforeEach(() => {
  setAppConfig({ hero: { image: "/images/church.jpg" } });
});

const mountHero = (hero: typeof HERO & { image?: string } = HERO) =>
  mount(HomeHero, { props: { hero } });

describe("HomeHero", () => {
  it("opens with the heading, what was written between asterisks a span of its own, for the styles to draw as the highlight", () => {
    const heading = mountHero().find("h1.page-title");
    expect(heading.text()).toBe("Discover God’s Love, Grace & Truth");
    const highlights = heading.findAll("span.home-hero-highlight");
    expect(highlights.map((span) => span.text())).toEqual([
      "Love, Grace & Truth",
    ]);
    expect(heading.html()).not.toContain("*");
  });

  it("opens with a heading with no highlight as it is written", () => {
    const heading = mountHero({ ...HERO, heading: "Come and see" }).find("h1");
    expect(heading.text()).toBe("Come and see");
    expect(heading.find("span").exists()).toBe(false);
  });

  it("goes on with the description and the call, each as the page's settings write it", () => {
    const hero = mountHero();
    expect(hero.find(".home-hero-content > p").text()).toBe(
      "Join us in the pursuit of His character.",
    );
    const cta = hero.find("a.cta");
    expect(cta.text()).toBe("Learn More");
    expect(cta.attributes("href")).toBe("/about-us");
  });

  it("shows the picture uploaded for it in the window beside the content", () => {
    const image = mountHero({
      ...HERO,
      image: "https://cdn.example.com/home/1.jpg",
    }).find(".home-hero-media.arch img");
    expect(image.attributes("src")).toBe("https://cdn.example.com/home/1.jpg");
    expect(image.attributes("alt")).toBe("");
  });

  it("shows the site's own picture while none is uploaded", () => {
    expect(mountHero().find(".home-hero-media img").attributes("src")).toBe(
      "/images/church.jpg",
    );
  });

  it("says and leads where the page says", () => {
    const cta = mountHero({
      ...HERO,
      action: "Plan a visit",
      link: "/connect",
    }).find("a.cta");
    expect(cta.text()).toBe("Plan a visit");
    expect(cta.attributes("href")).toBe("/connect");
  });

  it("is written in one language, whatever the reader's", () => {
    setLocale("es");
    expect(mountHero().find("a.cta").text()).toBe("Learn More");
  });
});
