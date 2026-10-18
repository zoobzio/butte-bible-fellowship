import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";

import type { ChurchEvent } from "@bbf/schema/types";

import { useNuxtApp } from "#imports";
import EventCalendar from "~/components/EventCalendar.vue";
import EventList from "~/components/EventList.vue";
import EventsBrowser from "~/components/EventsBrowser.vue";
import PageHeader from "~/components/PageHeader.vue";

const EVENTS: ChurchEvent[] = [
  { title: "Worship Service", day: "sunday", start: "10:00", end: "11:30" },
  { title: "Sunday School", day: "sunday", start: "08:45" },
  { title: "Harvest Dinner", date: "2026-10-24", start: "17:30" },
];

const { $t } = useNuxtApp();

const mountBrowser = (events?: ChurchEvent[]) =>
  mount(EventsBrowser, { props: { events } });

// A Sunday afternoon at the church.
beforeEach(() => {
  vi.useFakeTimers({ now: new Date("2026-10-04T20:00:00Z"), toFake: ["Date"] });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("EventsBrowser", () => {
  it("heads the page with its title and description", () => {
    expect(mountBrowser(EVENTS).findComponent(PageHeader).props()).toEqual({
      title: $t.events.title(),
      description: $t.events.description(),
    });
  });

  it("sets the calendar under the header, and the day's events after it", () => {
    const wrapper = mountBrowser(EVENTS);
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

  it("lists today's events as cards until a day is picked, earliest first", () => {
    const day = mountBrowser(EVENTS).find(".events-day");
    expect(day.attributes("aria-live")).toBe("polite");
    expect(day.find("h2 span").text()).toBe($t.events.selected());
    expect(day.find("h2 time").attributes("datetime")).toBe("2026-10-04");
    expect(day.find("h2 time").text()).toBe("Sunday, October 4");
    expect(day.findComponent(EventList).props("events")).toEqual([
      EVENTS[1],
      EVENTS[0],
    ]);
  });

  it("lists the events of the day picked on the calendar", async () => {
    const wrapper = mountBrowser(EVENTS);
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
    const wrapper = mountBrowser(EVENTS);
    await wrapper
      .find('.event-calendar-day:has(time[datetime="2026-10-05"]) button')
      .trigger("click");
    expect(wrapper.findComponent(EventList).props("events")).toEqual([]);
  });

  it("shows an empty calendar when the page lists no events", () => {
    const wrapper = mountBrowser();
    expect(wrapper.findComponent(EventCalendar).props("events")).toEqual([]);
    expect(wrapper.findComponent(EventList).props("events")).toEqual([]);
  });
});
