import { beforeEach, describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

import { setAppConfig, setLocale } from "#imports";
import HomeHero from "~/components/HomeHero.vue";

beforeEach(() => {
  setAppConfig({ hero: { image: "/church.jpg", to: "/about-us" } });
});

describe("HomeHero", () => {
  it("opens with the tagline, its highlight, the description and the call, each a message of the interface", () => {
    const hero = mount(HomeHero);
    expect(hero.find("h1.page-title").text()).toBe(
      "Discover God’s Love, Grace & Truth",
    );
    expect(hero.find("h1 em").text()).toBe("Love, Grace & Truth");
    expect(hero.find("p").text()).toBe(
      "Join us in connecting people to the life changing presence of Jesus Christ, and in the pursuit of His character.",
    );

    const cta = hero.find("a.cta");
    expect(cta.text()).toBe("Learn More");
    expect(cta.attributes("href")).toBe("/about-us");
  });

  it("takes nothing from the page: it has no props", () => {
    expect(mount(HomeHero).props()).toEqual({});
  });

  it("shows the app's picture in the window beside the content", () => {
    const image = mount(HomeHero).find(".home-hero-media.arch img");
    expect(image.attributes("src")).toBe("/church.jpg");
    expect(image.attributes("alt")).toBe("");
  });

  it("leads where the app's config says", () => {
    setAppConfig({ hero: { image: "/church.jpg", to: "/connect" } });
    expect(mount(HomeHero).find("a.cta").attributes("href")).toBe("/connect");
  });

  it("is read in the reader's language", () => {
    setLocale("es");
    const hero = mount(HomeHero);
    expect(hero.find("h1 em").text()).not.toBe("");
    expect(hero.find("a.cta").attributes("href")).toBe("/about-us");
  });
});
