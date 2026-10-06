import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

import type { CalendarDay } from "~/types/events";

import { setRoutePath, useNuxtApp } from "#imports";
import EventWeek from "~/components/EventWeek.vue";

const WORSHIP = {
  title: "Worship Service",
  slug: "worship-service",
  day: "sunday",
  start: "10:00",
  end: "11:30",
} as const;

const PRAYER = { title: "Prayer Meeting", day: "thursday", start: "10:00" };

const OPEN_HOUSE = { title: "Open House", start: "all day" };

// The week of October 4th: something on Sunday and Thursday, nothing between.
const DAYS: CalendarDay[] = [
  { date: "2026-10-04", events: [WORSHIP] },
  { date: "2026-10-05", events: [] },
  { date: "2026-10-06", events: [] },
  { date: "2026-10-07", events: [] },
  { date: "2026-10-08", events: [PRAYER, OPEN_HOUSE] },
  { date: "2026-10-09", events: [] },
  { date: "2026-10-10", events: [] },
];

const mountWeek = (days = DAYS) => mount(EventWeek, { props: { days } });

/** Every space a plain one: a formatter sets narrow ones about a time. */
const plain = (text: string) => text.replace(/\s/g, " ");

describe("EventWeek", () => {
  it("lists the days something is held on, in order, each under its date", () => {
    const days = mountWeek().findAll("ol.event-week > li");
    expect(
      days.map((day) => ({
        date: day.find("time").attributes("datetime"),
        label: day.find("time").text(),
      })),
    ).toEqual([
      { date: "2026-10-04", label: "Sun, Oct 4" },
      { date: "2026-10-08", label: "Thu, Oct 8" },
    ]);
  });

  it("lists a day's events with when each is held", () => {
    const [, thursday] = mountWeek().findAll("ol.event-week > li");
    expect(
      thursday!
        .findAll("ul > li")
        .map((event) =>
          event.findAll(":scope > *").map((part) => plain(part.text())),
        ),
    ).toEqual([["Prayer Meeting", "10:00 AM"], ["Open House"]]);
  });

  it("sets an event's start and end as one range", () => {
    const [sunday] = mountWeek().findAll("ol.event-week > li");
    expect(plain(sunday!.find(".event-week-time").text())).toBe(
      "10:00 – 11:30 AM",
    );
  });

  it("links each event to its page, and writes the week, in the route's locale", () => {
    setRoutePath("/es/about-us");
    const [sunday] = mountWeek().findAll("ol.event-week > li");
    expect(sunday!.find("a").attributes("href")).toBe(
      "/es/events/worship-service",
    );
    expect(sunday!.find("time").text()).toBe(
      new Intl.DateTimeFormat("es", {
        weekday: "short",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }).format(new Date("2026-10-04T00:00:00Z")),
    );
  });

  it("says so when nothing is held all week", () => {
    const wrapper = mountWeek(DAYS.map((day) => ({ ...day, events: [] })));
    expect(wrapper.find("ol").exists()).toBe(false);
    expect(wrapper.find("p.event-week-none").text()).toBe(
      useNuxtApp().$t.events.none(),
    );
  });
});
