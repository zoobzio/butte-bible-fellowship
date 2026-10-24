import { beforeEach, describe, expect, it } from "vitest";

import { setAppConfig, setContentPages, setRoutePath, useHead } from "#imports";
import EventArticle from "~/components/EventArticle.vue";
import Page from "~/pages/events/[event].vue";
import { document, element } from "#test/support/content";
import { mountSuspended } from "@bbf/nuxt/testing/mount";

const WORSHIP = {
  title: "Worship Service",
  slug: "worship-service",
  day: "sunday",
  start: "10:00",
};
const PRAYER = {
  title: "Reunión de Oración",
  slug: "prayer-meeting",
  day: "thursday",
  start: "10:00",
};
const DINNER = {
  title: "Harvest Dinner",
  slug: "harvest-dinner",
  date: "2026-10-14",
  start: "17:30",
};

const EVENTS_PAGE = document({
  title: "Events – Test Church",
  events: [WORSHIP, PRAYER, DINNER],
});

// What is written about the worship service: the other events have no page.
const WORSHIP_PAGE = document(
  { title: "Worship Service – Test Church" },
  element("p", {}, "We gather to worship."),
);

const mountPage = async (path: string) => {
  setContentPages({
    "/events": EVENTS_PAGE,
    "/events/worship-service": WORSHIP_PAGE,
  });
  setRoutePath(path);
  return mountSuspended(Page);
};

beforeEach(() => {
  setAppConfig({
    contact: { address: "1 Test Street", phone: "555", email: "o@e.org" },
    events: { image: "/images/church.jpg" },
  });
});

describe("event page", () => {
  it("hands the article the event its address names, and what is written about it", async () => {
    const { wrapper } = await mountPage("/events/worship-service");
    expect(wrapper.findComponent(EventArticle).props()).toEqual({
      event: WORSHIP,
      page: { title: "Worship Service – Test Church", body: WORSHIP_PAGE },
    });
  });

  it("finds an event by its own slug, in any locale, with no page of its own", async () => {
    const { wrapper } = await mountPage("/es/events/prayer-meeting");
    expect(wrapper.findComponent(EventArticle).props()).toEqual({
      event: PRAYER,
      page: null,
    });
  });

  it("titles the document after the event's own page, or after the event", async () => {
    await mountPage("/events/worship-service");
    expect(useHead.mock.calls[0]![0]()).toEqual({
      title: "Worship Service – Test Church",
    });

    useHead.mockClear();
    await mountPage("/events/harvest-dinner");
    expect(useHead.mock.calls[0]![0]()).toEqual({ title: "Harvest Dinner" });
  });

  it("throws a 404 when no event has the slug", async () => {
    const { wrapper, error } = await mountPage("/events/nope");
    expect(error).toMatchObject({
      statusCode: 404,
      message: "Page not found",
    });
    expect(wrapper.findComponent(EventArticle).exists()).toBe(false);
  });

  it("throws a 404 when the events page does not exist", async () => {
    setRoutePath("/events/worship-service");
    const { error } = await mountSuspended(Page);
    expect(error).toMatchObject({ statusCode: 404 });
  });
});
