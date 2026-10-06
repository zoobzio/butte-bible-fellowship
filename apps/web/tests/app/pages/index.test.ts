import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ContentRenderer } from "#components";
import { setContentPages, setRoutePath, useHead, useNuxtApp } from "#imports";
import SermonGrid from "~/components/SermonGrid.vue";
import { MARKDOWN_COMPONENTS } from "~/constants/markdown";
import Page from "~/pages/index.vue";
import { mountSuspended } from "#test/support/mount";

const HERO = {
  tagline: "Discover",
  highlight: "Grace",
  description: "Join us on Sundays.",
  cta: { label: "You're invited", to: "/youre-invited" },
};

const home = (hero?: Partial<typeof HERO> & { image?: string }) => ({
  path: "/",
  title: "Home – Test Church",
  hero,
});

const sermon = (id: string) => ({
  id,
  title: `Sermon ${id}`,
  published: "2026-10-04T18:16:28+00:00",
  thumbnail: `https://i4.ytimg.com/vi/${id}/hqdefault.jpg`,
});

const SERMONS = ["abc123", "def456", "ghi789", "jkl012"].map(sermon);

/** Has the site's API list these sermons. */
const listSermons = (sermons = SERMONS) => {
  vi.stubGlobal(
    "$fetch",
    vi.fn(async () => sermons),
  );
};

beforeEach(() => {
  listSermons();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("home page", () => {
  it("renders the hero from the page's front matter", async () => {
    setContentPages({ "/": home(HERO) });
    const { wrapper } = await mountSuspended(Page);

    const hero = wrapper.find(".home-hero");
    expect(hero.find("h1.page-title").text()).toBe("Discover Grace");
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

  it("shows the hero's image in the window beside the content", async () => {
    setContentPages({ "/": home({ ...HERO, image: "/church.jpg" }) });
    const { wrapper } = await mountSuspended(Page);

    const image = wrapper.find(".home-hero-media img");
    expect(image.attributes("src")).toBe("/church.jpg");
    expect(image.attributes("alt")).toBe("");
  });

  it("leaves the window empty until the hero has an image", async () => {
    setContentPages({ "/": home(HERO) });
    const { wrapper } = await mountSuspended(Page);

    const media = wrapper.find(".home-hero-media");
    expect(media.exists()).toBe(true);
    expect(media.find("img").exists()).toBe(false);
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

  it("keeps the site's measure around the hero, the body and the sermons", async () => {
    setContentPages({ "/": home(HERO) });
    const { wrapper } = await mountSuspended(Page);
    expect(
      wrapper
        .find(".home > .home-hero + section.prose + section.home-sermons")
        .exists(),
    ).toBe(true);
  });

  it("closes with the three newest sermons, under their heading", async () => {
    setContentPages({ "/": home(HERO) });
    const { wrapper } = await mountSuspended(Page);

    const sermons = wrapper.find(".home-sermons");
    expect(sermons.find("h2").text()).toBe(useNuxtApp().$t.sermons.recent());
    expect(sermons.findComponent(SermonGrid).props("sermons")).toEqual(
      SERMONS.slice(0, 3),
    );
  });

  it("links on to the sermons page, in the visitor's locale, in place of the channel", async () => {
    setRoutePath("/es");
    setContentPages({ "/": home(HERO) });
    const { wrapper } = await mountSuspended(Page);

    const links = wrapper.findAll(".home-sermons a.cta");
    expect(links.map((link) => link.attributes("href"))).toEqual([
      "/es/sermons",
    ]);
    expect(links[0]!.text()).toBe(useNuxtApp().$t.sermons.more());
  });

  it("leaves the sermons out when there are none to show", async () => {
    listSermons([]);
    setContentPages({ "/": home(HERO) });
    const { wrapper } = await mountSuspended(Page);
    expect(wrapper.find(".home-sermons").exists()).toBe(false);
    expect(wrapper.find("section.prose").exists()).toBe(true);
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
