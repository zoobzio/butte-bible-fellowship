import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

import type { Hero } from "@bbf/schema/types";

import { setRoutePath } from "#imports";
import HomeHero from "~/components/HomeHero.vue";

const HERO: Hero = {
  tagline: "Discover",
  highlight: "Grace",
  description: "Join us on Sundays.",
  cta: { label: "Learn more", to: "/about-us" },
};

const mountHero = (hero: Hero = HERO) => mount(HomeHero, { props: { hero } });

describe("HomeHero", () => {
  it("opens with the tagline, its highlight, the description and the call", () => {
    const hero = mountHero();
    expect(hero.find("h1.page-title").text()).toBe("Discover Grace");
    expect(hero.find("h1 em").text()).toBe("Grace");
    expect(hero.find("p").text()).toBe("Join us on Sundays.");

    const cta = hero.find("a.cta");
    expect(cta.text()).toBe("Learn more");
    expect(cta.attributes("href")).toBe("/about-us");
  });

  it("keeps the call's link in the visitor's locale", () => {
    setRoutePath("/es");
    expect(mountHero().find("a.cta").attributes("href")).toBe("/es/about-us");
  });

  it("leaves out the optional parts that are not set", () => {
    const hero = mountHero({ tagline: "Discover" });
    expect(hero.find("h1").text()).toBe("Discover");
    expect(hero.find("em").exists()).toBe(false);
    expect(hero.find("p").exists()).toBe(false);
    expect(hero.find("a").exists()).toBe(false);
  });

  it("shows the image in the window beside the content", () => {
    const image = mountHero({ ...HERO, image: "/church.jpg" }).find(
      ".home-hero-media img",
    );
    expect(image.attributes("src")).toBe("/church.jpg");
    expect(image.attributes("alt")).toBe("");
  });

  it("leaves the window empty until there is an image", () => {
    const media = mountHero().find(".home-hero-media");
    expect(media.exists()).toBe(true);
    expect(media.find("img").exists()).toBe(false);
  });
});
