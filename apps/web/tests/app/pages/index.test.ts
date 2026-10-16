import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { setContentPages, useHead } from "#imports";
import HomeHero from "~/components/HomeHero.vue";
import HomeSermons from "~/components/HomeSermons.vue";
import HomeWeek from "~/components/HomeWeek.vue";
import MarkdownBody from "~/components/MarkdownBody.vue";
import Page from "~/pages/index.vue";
import { document } from "#test/support/content";
import { mountSuspended } from "#test/support/mount";

const HERO = {
  tagline: "Discover",
  highlight: "Grace",
  description: "Join us on Sundays.",
  cta: { label: "Learn more", to: "/about-us" },
};

const home = (hero?: typeof HERO) =>
  document({ title: "Home – Test Church", ...(hero ? { hero } : {}) });

const SERMON = {
  id: "abc123",
  title: "Sermon abc123",
  published: "2026-10-04T18:16:28+00:00",
  thumbnail: "https://i4.ytimg.com/vi/abc123/hqdefault.jpg",
};

beforeEach(() => {
  vi.stubGlobal(
    "$fetch",
    vi.fn(async () => [SERMON]),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("home page", () => {
  it("opens with the hero from the page's front matter", async () => {
    setContentPages({ "/": home(HERO) });
    const { wrapper } = await mountSuspended(Page);
    expect(wrapper.findComponent(HomeHero).props("hero")).toEqual(HERO);
  });

  it("renders no hero when the page has none", async () => {
    setContentPages({ "/": home() });
    const { wrapper } = await mountSuspended(Page);
    expect(wrapper.findComponent(HomeHero).exists()).toBe(false);
  });

  it("renders the page body as markdown", async () => {
    const page = home(HERO);
    setContentPages({ "/": page });
    const { wrapper } = await mountSuspended(Page);
    expect(
      wrapper.find("section.prose").findComponent(MarkdownBody).props("page"),
    ).toEqual({ title: "Home – Test Church", hero: HERO, body: page });
  });

  it("keeps the site's measure around the hero, the body, the week and the sermons, in that order", async () => {
    setContentPages({ "/": home(HERO) });
    const { wrapper } = await mountSuspended(Page);
    expect(
      wrapper
        .find(
          ".home > .home-hero + section.prose + section.home-week + section.home-sermons",
        )
        .exists(),
    ).toBe(true);
    expect(wrapper.findComponent(HomeWeek).exists()).toBe(true);
    expect(wrapper.findComponent(HomeSermons).exists()).toBe(true);
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
      message: "Page not found",
    });
    expect(wrapper.find(".prose").exists()).toBe(false);
  });
});
