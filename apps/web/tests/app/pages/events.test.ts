import { afterEach, describe, expect, it, vi } from "vitest";

import { useHead } from "#imports";
import EventsBrowser from "~/components/EventsBrowser.vue";
import Page from "~/pages/events/index.vue";
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

const mountPage = async (events: unknown = EVENTS) => {
  const fetch = vi.fn(async () => events);
  vi.stubGlobal("$fetch", fetch);
  return { ...(await mountSuspended(Page)), fetch };
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("events page", () => {
  it("hands the events the API lists to the browser", async () => {
    const { wrapper, fetch } = await mountPage();
    expect(fetch).toHaveBeenCalledWith("/api/events");
    expect(wrapper.findComponent(EventsBrowser).props("events")).toEqual(
      EVENTS,
    );
  });

  it("hands the browser no events when the API lists none, or cannot be read", async () => {
    const { wrapper } = await mountPage([]);
    expect(wrapper.findComponent(EventsBrowser).props("events")).toEqual([]);
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => {
        throw new Error("The server is away.");
      }),
    );
    const away = await mountSuspended(Page);
    expect(away.error).toBeUndefined();
    expect(away.wrapper.findComponent(EventsBrowser).props("events")).toEqual(
      [],
    );
  });

  it("titles the document with the page's own message: it is no content", async () => {
    await mountPage();
    expect(useHead.mock.calls[0]![0]()).toEqual({
      title: "Events – Butte Bible Fellowship",
    });
  });
});
