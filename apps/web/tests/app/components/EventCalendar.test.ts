import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { mount } from "@vue/test-utils";

import type { ChurchEvent } from "#shared/types/events";

import { setRoutePath, useNuxtApp } from "#imports";
import EventCalendar from "~/components/EventCalendar.vue";

const EVENTS: ChurchEvent[] = [
  { title: "Worship Service", day: "sunday", start: "10:00", end: "11:30" },
  { title: "Sunday School", day: "sunday", start: "08:45", end: "09:30" },
  { title: "Stamp Ministry", day: "tuesday", weeks: [1, 3], start: "13:00" },
  { title: "Harvest Dinner", date: "2026-10-24", start: "17:30" },
];

const { $t } = useNuxtApp();

const mountCalendar = (events = EVENTS, selected = "2026-10-05") =>
  mount(EventCalendar, { props: { events, selected } });

type Calendar = ReturnType<typeof mountCalendar>;

const period = (wrapper: Calendar) => wrapper.find("h2").text();

const day = (wrapper: Calendar, date: string) =>
  wrapper.findAll(".event-calendar-day").find((day) => {
    return day.find("time").attributes("datetime") === date;
  })!;

/** The dates of the days whose buttons match a selector. */
const dates = (wrapper: Calendar, selector = "") =>
  wrapper
    .findAll(`.event-calendar-date${selector} time`)
    .map((time) => time.attributes("datetime"));

/** A day's events as the calendar lists them: each line's words and link. */
const lines = (wrapper: Calendar, date: string) =>
  day(wrapper, date)
    .findAll("a.event-calendar-event")
    .map((line) => ({
      text: line.text().replace(/\s+/g, " "),
      to: line.attributes("href"),
    }));

const press = async (wrapper: Calendar, label: string) => {
  const button = wrapper
    .findAll(".event-calendar-button")
    .find(
      (button) =>
        button.attributes("aria-label") === label || button.text() === label,
    )!;
  await button.trigger("click");
};

// A Monday afternoon at the church.
beforeEach(() => {
  vi.useFakeTimers({ now: new Date("2026-10-05T20:00:00Z"), toFake: ["Date"] });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("EventCalendar", () => {
  it("opens on the month today is in, in whole weeks", () => {
    const wrapper = mountCalendar();
    expect(wrapper.attributes("aria-label")).toBe($t.events.calendar());
    expect(period(wrapper)).toBe("October 2026");
    expect(dates(wrapper).length).toBe(35);
    expect(dates(wrapper)[0]).toBe("2026-09-27");
    expect(dates(wrapper)[34]).toBe("2026-10-31");
  });

  it("heads the grid with the days of the week, Sunday first", () => {
    const weekdays = mountCalendar().find(".event-calendar-weekdays");
    expect(weekdays.attributes("aria-hidden")).toBe("true");
    expect(weekdays.findAll("li").map((item) => item.text())).toEqual([
      "Sun",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
    ]);
  });

  it("selects a day from a button named by its date and how much is on", () => {
    const wrapper = mountCalendar();
    const sunday = day(wrapper, "2026-10-04").find("button");
    expect(sunday.find("time").text()).toBe("4");
    expect(sunday.attributes("aria-label")).toBe("Sunday, October 4, 2 events");
    const label = (date: string) =>
      day(wrapper, date).find("button").attributes("aria-label");
    expect(label("2026-10-05")).toBe("Monday, October 5, no events");
    expect(label("2026-10-24")).toBe("Saturday, October 24, 1 event");
  });

  it("lists a day's events from the earliest, each a link to its page", () => {
    const wrapper = mountCalendar();
    expect(lines(wrapper, "2026-10-04")).toEqual([
      { text: "8:45 AM Sunday School", to: "/events/sunday-school" },
      { text: "10:00 AM Worship Service", to: "/events/worship-service" },
    ]);
    expect(lines(wrapper, "2026-10-24")).toEqual([
      { text: "5:30 PM Harvest Dinner", to: "/events/harvest-dinner" },
    ]);
    expect(day(wrapper, "2026-10-05").find("ul").exists()).toBe(false);
  });

  it("keeps the events beside the day's button, not inside it", () => {
    const wrapper = mountCalendar();
    const sunday = day(wrapper, "2026-10-04");
    expect(sunday.find("button a").exists()).toBe(false);
    expect(sunday.find("button + ul.event-calendar-events").exists()).toBe(
      true,
    );
  });

  it("links an event by its own slug when it has one", () => {
    const wrapper = mountCalendar([
      { title: "Cena", slug: "harvest-dinner", date: "2026-10-24", start: "x" },
    ]);
    expect(lines(wrapper, "2026-10-24")).toEqual([
      { text: "Cena", to: "/events/harvest-dinner" },
    ]);
  });

  it("holds an event only in the weeks of the month it names", () => {
    const wrapper = mountCalendar();
    const held = ["2026-10-06", "2026-10-13", "2026-10-20", "2026-10-27"].map(
      (date) => lines(wrapper, date).length,
    );
    expect(held).toEqual([1, 0, 1, 0]);
  });

  it("marks today, the selected day, and the days of the months beside", () => {
    const wrapper = mountCalendar(EVENTS, "2026-10-08");
    expect(dates(wrapper, '[aria-current="date"]')).toEqual(["2026-10-05"]);
    expect(dates(wrapper, '[aria-pressed="true"]')).toEqual(["2026-10-08"]);
    expect(dates(wrapper, '[aria-pressed="false"]').length).toBe(34);
    const marked = (attribute: string) =>
      wrapper
        .findAll(`.event-calendar-day[${attribute}] time`)
        .map((time) => time.attributes("datetime"));
    expect(marked("data-selected")).toEqual(["2026-10-08"]);
    expect(marked("data-outside")).toEqual([
      "2026-09-27",
      "2026-09-28",
      "2026-09-29",
      "2026-09-30",
    ]);
  });

  it("asks for the day pressed to be selected", async () => {
    const wrapper = mountCalendar();
    await day(wrapper, "2026-10-24").find("button").trigger("click");
    expect(wrapper.emitted("update:selected")).toEqual([["2026-10-24"]]);
    expect(period(wrapper)).toBe("October 2026");
  });

  it("turns to the month of a day pressed outside the one shown", async () => {
    const wrapper = mountCalendar();
    await day(wrapper, "2026-09-29").find("button").trigger("click");
    expect(wrapper.emitted("update:selected")).toEqual([["2026-09-29"]]);
    expect(period(wrapper)).toBe("September 2026");
  });

  it("moves a month at a time, keeping the selection", async () => {
    const wrapper = mountCalendar();
    await press(wrapper, $t.events.nextMonth());
    expect(period(wrapper)).toBe("November 2026");
    expect(wrapper.find("[aria-current]").exists()).toBe(false);

    await press(wrapper, $t.events.previousMonth());
    await press(wrapper, $t.events.previousMonth());
    expect(period(wrapper)).toBe("September 2026");
    expect(wrapper.emitted("update:selected")).toBeUndefined();
  });

  it("comes back to today, and selects it", async () => {
    const wrapper = mountCalendar(EVENTS, "2026-10-24");
    await press(wrapper, $t.events.nextMonth());
    await press(wrapper, $t.events.today());
    expect(period(wrapper)).toBe("October 2026");
    expect(wrapper.emitted("update:selected")).toEqual([["2026-10-05"]]);
  });

  it("writes its dates and times, and links, in the route's locale", () => {
    setRoutePath("/es/events");
    const wrapper = mountCalendar();
    expect(period(wrapper)).toBe("octubre de 2026");
    expect(wrapper.find(".event-calendar-weekdays li").text()).toBe("dom");
    expect(lines(wrapper, "2026-10-24")).toEqual([
      { text: "17:30 Harvest Dinner", to: "/es/events/harvest-dinner" },
    ]);
  });

  it("takes today from the browser once mounted, at the church's date", async () => {
    const wrapper = mountCalendar();
    expect(dates(wrapper, "[aria-current]")).toEqual(["2026-10-05"]);
    // The page was rendered on the 5th and is opened on the 7th.
    vi.setSystemTime(new Date("2026-10-07T20:00:00Z"));
    const later = mountCalendar();
    await nextTick();
    expect(dates(later, "[aria-current]")).toEqual(["2026-10-07"]);
    expect(dates(wrapper, "[aria-current]")).toEqual(["2026-10-07"]);
  });
});
