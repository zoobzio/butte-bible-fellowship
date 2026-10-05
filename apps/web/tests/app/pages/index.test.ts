import { describe, expect, it } from "vitest";

import { ContentRenderer } from "#components";
import { setContentPages, useHead } from "#imports";
import { MARKDOWN_COMPONENTS } from "~/constants/markdown";
import Page from "~/pages/index.vue";
import { mountSuspended } from "#test/support/mount";

const HERO = {
  tagline: "Discover",
  highlight: "Grace",
  description: "Join us on Sundays.",
  cta: { label: "You're invited", to: "/youre-invited" },
};

const home = (hero?: Partial<typeof HERO>) => ({
  path: "/",
  title: "Home – Test Church",
  hero,
});

describe("home page", () => {
  it("renders the hero from the page's front matter", async () => {
    setContentPages({ "/": home(HERO) });
    const { wrapper } = await mountSuspended(Page);

    const hero = wrapper.find(".home-hero");
    expect(hero.find("h1").text()).toBe("Discover Grace");
    expect(hero.find("h1 em").text()).toBe("Grace");
    expect(hero.find("p").text()).toBe("Join us on Sundays.");

    const cta = hero.find("a.cta");
    expect(cta.text()).toBe("You're invited");
    expect(cta.attributes("href")).toBe("/youre-invited");
  });

  it("leaves out the optional hero parts that are not set", async () => {
    setContentPages({ "/": home({ tagline: "Discover" }) });
    const { wrapper } = await mountSuspended(Page);

    const hero = wrapper.find(".home-hero");
    expect(hero.find("h1").text()).toBe("Discover");
    expect(hero.find("em").exists()).toBe(false);
    expect(hero.find("p").exists()).toBe(false);
    expect(hero.find("a").exists()).toBe(false);
  });

  it("renders no hero when the page has none", async () => {
    setContentPages({ "/": home() });
    const { wrapper } = await mountSuspended(Page);
    expect(wrapper.find(".home-hero").exists()).toBe(false);
  });

  it("renders the page body with the app's markdown components and no prose components", async () => {
    const page = home(HERO);
    setContentPages({ "/": page });
    const { wrapper } = await mountSuspended(Page);

    const renderer = wrapper
      .find("section.prose")
      .findComponent(ContentRenderer);
    expect(renderer.props("value")).toEqual(page);
    expect(renderer.props("components")).toBe(MARKDOWN_COMPONENTS);
    expect(renderer.props("prose")).toBe(false);
  });

  it("titles the document after the page", async () => {
    setContentPages({ "/": home(HERO) });
    await mountSuspended(Page);
    expect(useHead.mock.calls[0]![0]()).toEqual({
      title: "Home – Test Church",
    });
  });

  it("throws a 404 when the home page does not exist", async () => {
    const { wrapper, error } = await mountSuspended(Page);
    expect(error).toMatchObject({
      statusCode: 404,
      statusMessage: "Page not found",
    });
    expect(wrapper.find(".prose").exists()).toBe(false);
  });
});
