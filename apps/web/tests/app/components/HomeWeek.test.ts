import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { setContentPages, setRoutePath, useNuxtApp } from "#imports";
import EventWeek from "~/components/EventWeek.vue";
import HomeWeek from "~/components/HomeWeek.vue";
import { document } from "#test/support/content";
import { mountSuspended } from "@bbf/nuxt/testing/mount";

const WORSHIP = {
  title: "Worship Service",
  slug: "worship-service",
  day: "sunday",
  start: "10:00",
};
const PRAYER = {
  title: "Prayer Meeting",
  slug: "prayer-meeting",
  day: "thursday",
  start: "10:00",
};
// Held once, the week after the one the tests are in.
const DINNER = {
  title: "Harvest Dinner",
  slug: "harvest-dinner",
  date: "2026-10-14",
  start: "17:30",
};

const EVENTS_PAGE = document({
  title: "Events – Test Church",
  events: [PRAYER, DINNER, WORSHIP],
});

const { $t } = useNuxtApp();

const mountWeek = async (
  path = "/",
  pages: Record<string, unknown> = { "/events": EVENTS_PAGE },
) => {
  setRoutePath(path);
  setContentPages(pages);
  const { wrapper } = await mountSuspended(HomeWeek);
  return wrapper;
};

beforeEach(() => {
  // A Tuesday at the church: its week is Sunday the 4th to Saturday the 10th.
  vi.useFakeTimers({
    now: new Date("2026-10-06T19:00:00Z"),
    toFake: ["Date"],
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("HomeWeek", () => {
  it("lists this week's days under their heading, each with the events held on it", async () => {
    const wrapper = await mountWeek();
    expect(wrapper.find("section.home-week > h2").text()).toBe(
      $t.events.thisWeek(),
    );
    expect(wrapper.findComponent(EventWeek).props("days")).toEqual([
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
    const wrapper = await mountWeek("/es");
    const link = wrapper.find(".home-week .event-week + a.cta");
    expect(link.text()).toBe($t.events.all());
    expect(link.attributes("href")).toBe("/es/events");
  });

  it("has an empty week when the events cannot be read", async () => {
    const wrapper = await mountWeek("/", {});
    expect(
      wrapper
        .findComponent(EventWeek)
        .props("days")
        .map((day: { events: unknown[] }) => day.events.length),
    ).toEqual([0, 0, 0, 0, 0, 0, 0]);
  });
});
