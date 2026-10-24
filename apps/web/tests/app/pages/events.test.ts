import type { Root } from "hast";

import { describe, expect, it } from "vitest";

import { setContentPages, setRoutePath, useHead } from "#imports";
import EventsBrowser from "~/components/EventsBrowser.vue";
import Page from "~/pages/events/index.vue";
import { document } from "#test/support/content";
import { mountSuspended } from "@bbf/nuxt/testing/mount";

const EVENTS = [
  {
    title: "Worship Service",
    slug: "worship-service",
    day: "sunday",
    start: "10:00",
    end: "11:30",
  },
  {
    title: "Harvest Dinner",
    slug: "harvest-dinner",
    date: "2026-10-24",
    start: "17:30",
  },
];

const EVENTS_PAGE = document({ title: "Events – Test Church", events: EVENTS });

const mountPage = async (page: Root = EVENTS_PAGE) => {
  setContentPages({ "/events": page });
  return mountSuspended(Page);
};

describe("events page", () => {
  it("hands the page's events to the browser", async () => {
    const { wrapper } = await mountPage();
    expect(wrapper.findComponent(EventsBrowser).props("events")).toEqual(
      EVENTS,
    );
  });

  it("hands the browser no events when the page lists none", async () => {
    const { wrapper } = await mountPage(
      document({ title: "Events – Test Church" }),
    );
    expect(wrapper.findComponent(EventsBrowser).props("events")).toEqual([]);
  });

  it("titles the document after the page, whatever locale the route is in", async () => {
    setRoutePath("/es/events");
    await mountPage();
    expect(useHead.mock.calls[0]![0]()).toEqual({
      title: "Events – Test Church",
    });
  });

  it("throws a 404 when the page does not exist", async () => {
    const { wrapper, error } = await mountSuspended(Page);
    expect(error).toMatchObject({
      statusCode: 404,
      message: "Page not found",
    });
    expect(wrapper.findComponent(EventsBrowser).exists()).toBe(false);
  });
});
