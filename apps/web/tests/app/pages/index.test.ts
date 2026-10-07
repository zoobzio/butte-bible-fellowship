import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ContentRenderer } from "#components";
import { setContentPages, setRoutePath, useHead, useNuxtApp } from "#imports";
import EventWeek from "~/components/EventWeek.vue";
import SermonGrid from "~/components/SermonGrid.vue";
import { MARKDOWN_COMPONENTS } from "~/constants/markdown";
import Page from "~/pages/index.vue";
import { mountSuspended } from "#test/support/mount";

const HERO = {
  tagline: "Discover",
  highlight: "Grace",
  description: "Join us on Sundays.",
  cta: { label: "You're invited", to: "/#youre-invited" },
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

const WORSHIP = { title: "Worship Service", day: "sunday", start: "10:00" };
const PRAYER = { title: "Prayer Meeting", day: "thursday", start: "10:00" };
// Held once, the week after the one the tests are in.
const DINNER = { title: "Harvest Dinner", date: "2026-10-14", start: "17:30" };

const EVENTS_PAGE = {
  path: "/events",
  title: "Events – Test Church",
  events: [PRAYER, DINNER, WORSHIP],
};

/** Has the site's API list these sermons. */
const listSermons = (sermons = SERMONS) => {
  vi.stubGlobal(
    "$fetch",
    vi.fn(async () => sermons),
  );
};

beforeEach(() => {
  listSermons();
  // A Tuesday at the church: its week is Sunday the 4th to Saturday the 10th.
  vi.useFakeTimers({
    now: new Date("2026-10-06T19:00:00Z"),
    toFake: ["Date"],
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
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
    expect(cta.attributes("href")).toBe("/#youre-invited");
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

  it("keeps the site's measure around the hero, the body, the week and the sermons", async () => {
    setContentPages({ "/": home(HERO) });
    const { wrapper } = await mountSuspended(Page);
    expect(
      wrapper
        .find(
          ".home > .home-hero + section.prose + section.home-week + section.home-sermons",
        )
        .exists(),
    ).toBe(true);
  });

  it("lists this week's days ahead of the sermons, each with the events held on it", async () => {
    setContentPages({ "/": home(HERO), "/events": EVENTS_PAGE });
    const { wrapper } = await mountSuspended(Page);

    const section = wrapper.find(".home-week");
    expect(section.find("h2").text()).toBe(useNuxtApp().$t.events.thisWeek());
    expect(section.findComponent(EventWeek).props("days")).toEqual([
      { date: "2026-10-04", events: [WORSHIP] },
      { date: "2026-10-05", events: [] },
      { date: "2026-10-06", events: [] },
      { date: "2026-10-07", events: [] },
      { date: "2026-10-08", events: [PRAYER] },
      { date: "2026-10-09", events: [] },
      { date: "2026-10-10", events: [] },
    ]);
  });

  it("links on to every event, in the visitor's locale, under the week", async () => {
    setRoutePath("/es");
    setContentPages({ "/": home(HERO), "/events": EVENTS_PAGE });
    const { wrapper } = await mountSuspended(Page);

    const link = wrapper.find(".home-week .event-week + a.cta");
    expect(link.text()).toBe(useNuxtApp().$t.events.all());
    expect(link.attributes("href")).toBe("/es/events");
  });

  it("has an empty week when the events cannot be read", async () => {
    setContentPages({ "/": home(HERO) });
    const { wrapper } = await mountSuspended(Page);
    expect(
      wrapper
        .findComponent(EventWeek)
        .props("days")
        .map((day: { events: unknown[] }) => day.events.length),
    ).toEqual([0, 0, 0, 0, 0, 0, 0]);
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
