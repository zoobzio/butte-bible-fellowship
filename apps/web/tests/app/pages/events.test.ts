import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { setContentPages, setRoutePath, useHead, useNuxtApp } from "#imports";
import EventCalendar from "~/components/EventCalendar.vue";
import EventList from "~/components/EventList.vue";
import PageHeader from "~/components/PageHeader.vue";
import Page from "~/pages/events/index.vue";
import { mountSuspended } from "#test/support/mount";

const EVENTS = [
  { title: "Worship Service", day: "sunday", start: "10:00", end: "11:30" },
  { title: "Sunday School", day: "sunday", start: "08:45" },
  { title: "Harvest Dinner", date: "2026-10-24", start: "17:30" },
];

const EVENTS_PAGE = {
  path: "/events",
  title: "Events – Test Church",
  events: EVENTS,
};

const mountPage = async (page: object = EVENTS_PAGE) => {
  setContentPages({ "/events": page });
  return mountSuspended(Page);
};

// A Sunday afternoon at the church.
beforeEach(() => {
  vi.useFakeTimers({ now: new Date("2026-10-04T20:00:00Z"), toFake: ["Date"] });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("events page", () => {
  it("heads the page with its title and description", async () => {
    const { wrapper } = await mountPage();
    const { $t } = useNuxtApp();
    expect(wrapper.findComponent(PageHeader).props()).toEqual({
      title: $t.events.title(),
      description: $t.events.description(),
    });
  });

  it("sets the calendar under the header, and the day's events after it", async () => {
    const { wrapper } = await mountPage();
    expect(
      wrapper
        .find(".events > .page-header + .event-calendar + aside.events-day")
        .exists(),
    ).toBe(true);
    expect(wrapper.findComponent(EventCalendar).props()).toEqual({
      events: EVENTS,
      selected: "2026-10-04",
    });
  });

  it("lists today's events as cards until a day is picked, earliest first", async () => {
    const { wrapper } = await mountPage();
    const { $t } = useNuxtApp();
    const day = wrapper.find(".events-day");
    expect(day.find("h2 span").text()).toBe($t.events.selected());
    expect(day.find("h2 time").attributes("datetime")).toBe("2026-10-04");
    expect(day.find("h2 time").text()).toBe("Sunday, October 4");
    expect(day.findComponent(EventList).props("events")).toEqual([
      EVENTS[1],
      EVENTS[0],
    ]);
  });

  it("lists the events of the day picked on the calendar", async () => {
    const { wrapper } = await mountPage();
    await wrapper
      .find('.event-calendar-day:has(time[datetime="2026-10-24"]) button')
      .trigger("click");

    expect(wrapper.findComponent(EventCalendar).props("selected")).toBe(
      "2026-10-24",
    );
    expect(wrapper.find(".events-day h2 time").text()).toBe(
      "Saturday, October 24",
    );
    expect(wrapper.findComponent(EventList).props("events")).toEqual([
      EVENTS[2],
    ]);
  });

  it("hands the list an empty day", async () => {
    const { wrapper } = await mountPage();
    await wrapper
      .find('.event-calendar-day:has(time[datetime="2026-10-05"]) button')
      .trigger("click");
    expect(wrapper.findComponent(EventList).props("events")).toEqual([]);
  });

  it("shows an empty calendar when the page lists no events", async () => {
    const { wrapper } = await mountPage({ ...EVENTS_PAGE, events: undefined });
    expect(wrapper.findComponent(EventCalendar).props("events")).toEqual([]);
    expect(wrapper.findComponent(EventList).props("events")).toEqual([]);
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
    expect(wrapper.find(".events").exists()).toBe(false);
  });
});
