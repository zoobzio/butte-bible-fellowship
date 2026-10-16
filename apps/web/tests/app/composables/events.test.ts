import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { nextTick, ref } from "vue";

import type { CalendarDay } from "~/types/events";
import type { PageItem } from "~/types/page";

import type { ChurchEvent } from "@bbf/validators/types";

import {
  requestedDocuments,
  setAppConfig,
  setContentPages,
  setRoutePath,
  useState,
} from "#imports";
import {
  useEventCalendar,
  useEventDate,
  useEventDays,
  useEventDetails,
  useEventLink,
  useEventListing,
  useEvent,
  useEventArticle,
  useEvents,
  useEventsHeldOn,
  useEventsThisWeek,
  useEventStart,
  useSelectedDay,
  useEventTime,
  useEventWeek,
  useToday,
} from "~/composables/events";
import { document } from "#test/support/content";
import { withSetup } from "#test/support/mount";

/** Every space a plain one: a formatter sets narrow ones about a time. */
const plain = (text: string | undefined) => text?.replace(/\s/g, " ");

const WORSHIP: ChurchEvent = {
  title: "Worship Service",
  slug: "worship-service",
  day: "sunday",
  start: "10:00",
  end: "11:30",
};

const SCHOOL: ChurchEvent = {
  title: "Sunday School",
  day: "sunday",
  start: "08:45",
  end: "09:30",
};

const STAMPS: ChurchEvent = {
  title: "Stamp Ministry",
  day: "tuesday",
  weeks: [1, 3],
  start: "13:00",
};

const DINNER: ChurchEvent = {
  title: "Harvest Dinner",
  date: "2026-10-24",
  start: "17:30",
  note: "Bring a dish",
};

const OPEN_HOUSE: ChurchEvent = { title: "Open House", start: "all day" };

afterEach(() => {
  vi.useRealTimers();
});

describe("useToday", () => {
  it("is the date at the church", () => {
    // Early on the 5th in UTC is still the evening of the 4th in California.
    vi.useFakeTimers({
      now: new Date("2026-10-05T03:00:00Z"),
      toFake: ["Date"],
    });
    expect(withSetup(useToday).result.value).toBe("2026-10-04");
  });

  it("puts right, once mounted, the day a page was rendered on", () => {
    vi.useFakeTimers({
      now: new Date("2026-10-07T20:00:00Z"),
      toFake: ["Date"],
    });
    // What the server rendered, days before, comes with the page.
    useState("events:today", () => "2026-10-01");
    expect(withSetup(useToday).result.value).toBe("2026-10-07");
  });

  it("is one date for everything that asks", () => {
    const first = withSetup(useToday).result;
    const second = withSetup(useToday).result;
    first.value = "2026-01-01";
    expect(second.value).toBe("2026-01-01");
  });
});

describe("useEventTime", () => {
  /** Every space a plain one: a formatter sets narrow ones about a time. */
  const said = (start: string, end?: string) =>
    withSetup(useEventTime)
      .result({ title: "Event", start, end })
      ?.replace(/\s/g, " ");

  it("says when an event starts, on the reader's clock", () => {
    expect(said("17:30")).toBe("5:30 PM");
  });

  it("says an event's start and end as one range", () => {
    expect(said("10:00", "11:30")).toBe("10:00 – 11:30 AM");
  });

  it("says only the start when the end cannot be read", () => {
    expect(said("10:00", "late")).toBe("10:00 AM");
  });

  it("has nothing to say when the start cannot be read", () => {
    expect(said("all day")).toBeUndefined();
  });

  it("says the time as the route's locale writes it", () => {
    setRoutePath("/es/events");
    expect(said("17:30")).toBe(
      new Intl.DateTimeFormat("es", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: "UTC",
      })
        .format(new Date(17.5 * 60 * 60 * 1000))
        .replace(/\s/g, " "),
    );
  });
});

describe("useEventDays", () => {
  const said = (event: Partial<ChurchEvent>) =>
    withSetup(useEventDays).result({
      title: "Event",
      start: "10:00",
      ...event,
    });

  it("says the one date of an event held once", () => {
    expect(said({ date: "2026-10-14" })).toBe("Wednesday, October 14");
  });

  it("says the day of the week an event repeats on", () => {
    expect(said({ day: "sunday" })).toBe("Every Sunday");
    expect(said({ day: "saturday" })).toBe("Every Saturday");
  });

  it("says which of the month's weeks an event is held in, in their order", () => {
    expect(said({ day: "tuesday", weeks: [3, 1] })).toBe(
      "Every first and third Tuesday",
    );
    expect(said({ day: "friday", weeks: [2] })).toBe("Every second Friday");
  });

  it("says an event with no weeks named is held every week", () => {
    expect(said({ day: "thursday", weeks: [] })).toBe("Every Thursday");
  });

  it("says the date of an event that has a day as well", () => {
    expect(said({ date: "2026-10-14", day: "sunday" })).toBe(
      "Wednesday, October 14",
    );
  });

  it("has nothing to say of an event with neither a date nor a day", () => {
    expect(said({})).toBeUndefined();
  });

  it("names the date and the day as the route's locale does", () => {
    setRoutePath("/es/events");
    expect(said({ date: "2026-10-14" })).toBe(
      new Intl.DateTimeFormat("es", {
        weekday: "long",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      }).format(new Date("2026-10-14T00:00:00Z")),
    );
    expect(said({ day: "sunday" })).toContain("domingo");
  });
});

describe("useEventDate", () => {
  it("says a date as the options ask, in the route's locale", () => {
    const { result } = withSetup(() =>
      useEventDate({ weekday: "long", month: "long", day: "numeric" }),
    );
    expect(result("2026-10-14")).toBe("Wednesday, October 14");
    setRoutePath("/es/events");
    expect(result("2026-10-14")).toBe("miércoles, 14 de octubre");
  });

  it("reads a date where it was written, whatever the clock's zone", () => {
    const { result } = withSetup(() => useEventDate({ day: "numeric" }));
    expect(result("2026-10-01")).toBe("1");
    expect(result("2026-10-31")).toBe("31");
  });
});

describe("useEventStart", () => {
  const said = (event: ChurchEvent) =>
    plain(withSetup(useEventStart).result(event));

  it("says when an event starts, and not when it ends", () => {
    expect(said(WORSHIP)).toBe("10:00 AM");
    expect(said(DINNER)).toBe("5:30 PM");
  });

  it("has nothing to say when the start cannot be read", () => {
    expect(said(OPEN_HOUSE)).toBeUndefined();
  });

  it("says the time as the route's locale writes it", () => {
    setRoutePath("/es/events");
    expect(said(DINNER)).toBe("17:30");
  });
});

describe("useEventLink", () => {
  const linked = (event: ChurchEvent) => withSetup(useEventLink).result(event);

  it("is the way to the event's page, by its slug or its title", () => {
    expect(linked(WORSHIP)).toBe("/events/worship-service");
    expect(linked({ title: "Men’s Breakfast & Bible Study", start: "x" })).toBe(
      "/events/mens-breakfast-bible-study",
    );
  });

  it("keeps the link in the route's locale", () => {
    setRoutePath("/es/about-us");
    expect(linked(WORSHIP)).toBe("/es/events/worship-service");
  });
});

describe("useEventListing", () => {
  it("sets each event as a list does, in the order handed", () => {
    const { result } = withSetup(() =>
      useEventListing([WORSHIP, DINNER, OPEN_HOUSE]),
    );
    expect(
      result.value.map((event) => ({ ...event, time: plain(event.time) })),
    ).toEqual([
      {
        title: "Worship Service",
        note: undefined,
        time: "10:00 – 11:30 AM",
        to: "/events/worship-service",
      },
      {
        title: "Harvest Dinner",
        note: "Bring a dish",
        time: "5:30 PM",
        to: "/events/harvest-dinner",
      },
      {
        title: "Open House",
        note: undefined,
        time: undefined,
        to: "/events/open-house",
      },
    ]);
  });

  it("follows the events it was handed", async () => {
    const events = ref<ChurchEvent[]>([]);
    const { result } = withSetup(() => useEventListing(events));
    expect(result.value).toEqual([]);
    events.value = [DINNER];
    await nextTick();
    expect(result.value.map((event) => event.title)).toEqual([
      "Harvest Dinner",
    ]);
  });

  it("writes the time and the link in the route's locale", () => {
    setRoutePath("/es/events");
    const { result } = withSetup(() => useEventListing([DINNER]));
    expect(plain(result.value[0]!.time)).toBe("17:30");
    expect(result.value[0]!.to).toBe("/es/events/harvest-dinner");
  });
});

describe("useEventWeek", () => {
  // The week of October 4th: something on Sunday and Thursday, nothing between.
  const PRAYER: ChurchEvent = {
    title: "Prayer Meeting",
    day: "thursday",
    start: "10:00",
  };
  const DAYS: CalendarDay[] = [
    { date: "2026-10-04", events: [WORSHIP] },
    { date: "2026-10-05", events: [] },
    { date: "2026-10-06", events: [] },
    { date: "2026-10-07", events: [] },
    { date: "2026-10-08", events: [PRAYER, OPEN_HOUSE] },
    { date: "2026-10-09", events: [] },
    { date: "2026-10-10", events: [] },
  ];

  it("lists the days something is held on, each under its date, with its events", () => {
    const { result } = withSetup(() => useEventWeek(DAYS));
    expect(
      result.value.map((day) => ({
        date: day.date,
        label: day.label,
        events: day.events.map((event) => [event.title, plain(event.time)]),
      })),
    ).toEqual([
      {
        date: "2026-10-04",
        label: "Sun, Oct 4",
        events: [["Worship Service", "10:00 – 11:30 AM"]],
      },
      {
        date: "2026-10-08",
        label: "Thu, Oct 8",
        events: [
          ["Prayer Meeting", "10:00 AM"],
          ["Open House", undefined],
        ],
      },
    ]);
  });

  it("has nothing to list of a week nothing is held in", () => {
    const { result } = withSetup(() =>
      useEventWeek(DAYS.map((day) => ({ ...day, events: [] }))),
    );
    expect(result.value).toEqual([]);
  });

  it("writes the dates and the links in the route's locale", () => {
    setRoutePath("/es/about-us");
    const { result } = withSetup(() => useEventWeek(DAYS));
    expect(result.value[0]!.label).toBe("dom, 4 oct");
    expect(result.value[0]!.events[0]!.to).toBe("/es/events/worship-service");
  });
});

describe("useEventDetails", () => {
  const CONTACT = {
    address: "1 Test Street, Testville",
    phone: "555-010-0199",
    email: "office@example.org",
  };

  const details = (event: ChurchEvent) => {
    setAppConfig({ contact: CONTACT });
    const { result } = withSetup(() => useEventDetails(event));
    return {
      when: result.when.value.map(plain),
      where: result.where.value,
      questions: result.questions.value,
    };
  };

  it("says when the event is held, its days and then its time", () => {
    expect(details(WORSHIP).when).toEqual(["Every Sunday", "10:00 – 11:30 AM"]);
  });

  it("says only as much of when as the event does", () => {
    expect(details({ ...OPEN_HOUSE, day: "saturday" }).when).toEqual([
      "Every Saturday",
    ]);
    expect(details(OPEN_HOUSE).when).toEqual([]);
  });

  it("holds the event at the church until it names a place of its own", () => {
    expect(details(WORSHIP).where).toBe("1 Test Street, Testville");
    expect(details({ ...WORSHIP, location: "Bidwell Park" }).where).toBe(
      "Bidwell Park",
    );
  });

  it("gives the office's phone to call and email to write to", () => {
    expect(details(WORSHIP).questions).toEqual([
      { text: "555-010-0199", href: "tel:5550100199" },
      { text: "office@example.org", href: "mailto:office@example.org" },
    ]);
  });

  it("follows the event it was handed", async () => {
    setAppConfig({ contact: CONTACT });
    const event = ref<ChurchEvent>(WORSHIP);
    const { result } = withSetup(() => useEventDetails(event));
    event.value = DINNER;
    await nextTick();
    expect(result.when.value[0]).toBe("Saturday, October 24");
  });
});

describe("useEventCalendar", () => {
  const EVENTS = [WORSHIP, SCHOOL, STAMPS, DINNER];

  const setUp = (events = EVENTS, selected = "2026-10-05") => {
    const onSelect = vi.fn();
    const picked = ref(selected);
    const { result } = withSetup(() =>
      useEventCalendar(events, picked, onSelect),
    );
    return { ...result, onSelect, picked };
  };

  /** The dates of the days a mark is set on. */
  const marked = (
    days: ReturnType<typeof setUp>["days"],
    mark: "today" | "selected" | "outside",
  ) => days.value.filter((day) => day[mark]).map((day) => day.date);

  // A Monday afternoon at the church.
  beforeEach(() => {
    vi.useFakeTimers({
      now: new Date("2026-10-05T20:00:00Z"),
      toFake: ["Date"],
    });
  });

  it("opens on the month today is in, in whole weeks, headed by the days of the week", () => {
    const { period, weekdays, days } = setUp();
    expect(period.value).toBe("October 2026");
    expect(weekdays.value).toEqual([
      "Sun",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
    ]);
    expect(days.value.length).toBe(35);
    expect(days.value[0]!.date).toBe("2026-09-27");
    expect(days.value[34]!.date).toBe("2026-10-31");
  });

  it("names each day by its date and how much is on, and numbers it", () => {
    const { days } = setUp();
    const day = (date: string) => days.value.find((day) => day.date === date)!;
    expect(day("2026-10-04").number).toBe(4);
    expect(day("2026-10-04").label).toBe("Sunday, October 4, 2 events");
    expect(day("2026-10-05").label).toBe("Monday, October 5, no events");
    expect(day("2026-10-24").label).toBe("Saturday, October 24, 1 event");
  });

  it("lists a day's events from the earliest, each with its start and link", () => {
    const { days } = setUp();
    const day = (date: string) => days.value.find((day) => day.date === date)!;
    expect(
      day("2026-10-04").events.map((event) => ({
        ...event,
        time: plain(event.time),
      })),
    ).toEqual([
      { title: "Sunday School", time: "8:45 AM", to: "/events/sunday-school" },
      {
        title: "Worship Service",
        time: "10:00 AM",
        to: "/events/worship-service",
      },
    ]);
    expect(day("2026-10-05").events).toEqual([]);
    expect(
      ["2026-10-06", "2026-10-13", "2026-10-20", "2026-10-27"].map(
        (date) => day(date).events.length,
      ),
    ).toEqual([1, 0, 1, 0]);
  });

  it("marks today, the selected day, and the days of the months beside", () => {
    const { days } = setUp(EVENTS, "2026-10-08");
    expect(marked(days, "today")).toEqual(["2026-10-05"]);
    expect(marked(days, "selected")).toEqual(["2026-10-08"]);
    expect(marked(days, "outside")).toEqual([
      "2026-09-27",
      "2026-09-28",
      "2026-09-29",
      "2026-09-30",
    ]);
  });

  it("follows the selection it was handed", async () => {
    const { days, picked } = setUp();
    picked.value = "2026-10-24";
    await nextTick();
    expect(marked(days, "selected")).toEqual(["2026-10-24"]);
  });

  it("asks for the day selected, turning to its month when it is of another", () => {
    const { period, select, onSelect } = setUp();
    select("2026-10-24");
    expect(onSelect).toHaveBeenLastCalledWith("2026-10-24");
    expect(period.value).toBe("October 2026");
    select("2026-09-29");
    expect(onSelect).toHaveBeenLastCalledWith("2026-09-29");
    expect(period.value).toBe("September 2026");
  });

  it("moves a month at a time, asking for nothing", () => {
    const { period, days, move, onSelect } = setUp();
    move(1);
    expect(period.value).toBe("November 2026");
    expect(marked(days, "today")).toEqual([]);
    move(-2);
    expect(period.value).toBe("September 2026");
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("comes back to today, and asks for it", () => {
    const { period, move, reset, onSelect } = setUp(EVENTS, "2026-10-24");
    move(1);
    reset();
    expect(period.value).toBe("October 2026");
    expect(onSelect).toHaveBeenCalledWith("2026-10-05");
  });

  it("writes the month, the days and the links in the route's locale", () => {
    setRoutePath("/es/events");
    const { period, weekdays, days } = setUp();
    expect(period.value).toBe("octubre de 2026");
    expect(weekdays.value[0]).toBe("dom");
    const dinner = days.value.find((day) => day.date === "2026-10-24")!;
    expect(plain(dinner.events[0]!.time)).toBe("17:30");
    expect(dinner.events[0]!.to).toBe("/es/events/harvest-dinner");
  });
});

describe("useEvents", () => {
  const EVENTS_PAGE = document({ title: "Events", events: [WORSHIP] });

  it("reads the events off the events page, whichever page asks", async () => {
    setContentPages({ "/events": EVENTS_PAGE });
    setRoutePath("/connect");
    const events = await useEvents();
    expect(events.value).toEqual([WORSHIP]);
  });

  it("reads them in the route's locale", async () => {
    setContentPages({ "/events": EVENTS_PAGE });
    setRoutePath("/es/connect");
    await useEvents();
    expect(requestedDocuments).toEqual(["es/events.json"]);
  });

  it("has none when the events page cannot be read, or lists none", async () => {
    setRoutePath("/");
    expect((await useEvents()).value).toEqual([]);
    setContentPages({ "/events": document({ title: "Events" }) });
    expect((await useEvents()).value).toEqual([]);
  });
});

describe("useEventsHeldOn", () => {
  const PRAYER: ChurchEvent = {
    title: "Prayer Meeting",
    day: "thursday",
    start: "10:00",
  };
  // Held once, on a Sunday.
  const SUNDAY_DINNER: ChurchEvent = { ...DINNER, date: "2026-10-18" };

  it("is what repeats on a day of the week, from the earliest start", () => {
    const { result } = withSetup(() =>
      useEventsHeldOn([PRAYER, SUNDAY_DINNER, WORSHIP, SCHOOL], "sunday"),
    );
    expect(result.value).toEqual([SCHOOL, WORSHIP]);
  });

  it("follows the events and the day it was handed", async () => {
    const events = ref<ChurchEvent[]>([WORSHIP, PRAYER]);
    const day = ref<"sunday" | "thursday">("sunday");
    const { result } = withSetup(() => useEventsHeldOn(events, day));
    day.value = "thursday";
    await nextTick();
    expect(result.value).toEqual([PRAYER]);
    events.value = [];
    await nextTick();
    expect(result.value).toEqual([]);
  });
});

describe("useEventsThisWeek", () => {
  const PRAYER: ChurchEvent = {
    title: "Prayer Meeting",
    day: "thursday",
    start: "10:00",
  };
  // Held once, the week after the one the tests are in.
  const NEXT_WEEK: ChurchEvent = { ...DINNER, date: "2026-10-14" };

  // A Tuesday at the church: its week is Sunday the 4th to Saturday the 10th.
  beforeEach(() => {
    vi.useFakeTimers({
      now: new Date("2026-10-06T19:00:00Z"),
      toFake: ["Date"],
    });
  });

  it("is the week today is in, Sunday to Saturday, each day with its events", () => {
    const { result } = withSetup(() =>
      useEventsThisWeek([PRAYER, NEXT_WEEK, WORSHIP]),
    );
    expect(result.value).toEqual([
      { date: "2026-10-04", events: [WORSHIP] },
      { date: "2026-10-05", events: [] },
      { date: "2026-10-06", events: [] },
      { date: "2026-10-07", events: [] },
      { date: "2026-10-08", events: [PRAYER] },
      { date: "2026-10-09", events: [] },
      { date: "2026-10-10", events: [] },
    ]);
  });

  it("follows today, and the events it was handed", async () => {
    const events = ref<ChurchEvent[]>([]);
    const { result } = withSetup(() => useEventsThisWeek(events));
    expect(result.value.every((day) => day.events.length === 0)).toBe(true);
    events.value = [NEXT_WEEK];
    withSetup(useToday).result.value = "2026-10-14";
    await nextTick();
    expect(result.value[0]!.date).toBe("2026-10-11");
    expect(result.value[3]!.events).toEqual([NEXT_WEEK]);
  });
});

describe("useEventsThisWeek", () => {
  const PRAYER: ChurchEvent = {
    title: "Prayer Meeting",
    day: "thursday",
    start: "10:00",
  };
  // Held once, the week after the one the tests are in.
  const NEXT_WEEK: ChurchEvent = { ...DINNER, date: "2026-10-14" };

  // A Tuesday at the church: its week is Sunday the 4th to Saturday the 10th.
  beforeEach(() => {
    vi.useFakeTimers({
      now: new Date("2026-10-06T19:00:00Z"),
      toFake: ["Date"],
    });
  });

  it("is the week today is in, Sunday to Saturday, each day with its events", () => {
    const { result } = withSetup(() =>
      useEventsThisWeek([PRAYER, NEXT_WEEK, WORSHIP]),
    );
    expect(result.value).toEqual([
      { date: "2026-10-04", events: [WORSHIP] },
      { date: "2026-10-05", events: [] },
      { date: "2026-10-06", events: [] },
      { date: "2026-10-07", events: [] },
      { date: "2026-10-08", events: [PRAYER] },
      { date: "2026-10-09", events: [] },
      { date: "2026-10-10", events: [] },
    ]);
  });

  it("follows today, and the events it was handed", async () => {
    const events = ref<ChurchEvent[]>([]);
    const { result } = withSetup(() => useEventsThisWeek(events));
    expect(result.value.every((day) => day.events.length === 0)).toBe(true);
    events.value = [NEXT_WEEK];
    withSetup(useToday).result.value = "2026-10-14";
    await nextTick();
    expect(result.value[0]!.date).toBe("2026-10-11");
    expect(result.value[3]!.events).toEqual([NEXT_WEEK]);
  });
});

describe("useEvent", () => {
  const PRAYER: ChurchEvent = {
    title: "Reunión de Oración",
    slug: "prayer-meeting",
    day: "thursday",
    start: "10:00",
  };
  const EVENTS_PAGE = document({
    title: "Events",
    events: [WORSHIP, PRAYER, DINNER],
  });

  it("is the event the address names, by its title's slug or its own", async () => {
    setContentPages({ "/events": EVENTS_PAGE });
    setRoutePath("/events/harvest-dinner");
    expect((await useEvent()).value).toEqual(DINNER);
    setRoutePath("/es/events/prayer-meeting");
    expect((await useEvent()).value).toEqual(PRAYER);
  });

  it("follows the route", async () => {
    setContentPages({ "/events": EVENTS_PAGE });
    setRoutePath("/events/harvest-dinner");
    const event = await useEvent();
    setRoutePath("/events/worship-service");
    expect(event.value).toEqual(WORSHIP);
  });

  it("is none when no event has the slug, or the events cannot be read", async () => {
    setContentPages({ "/events": EVENTS_PAGE });
    setRoutePath("/events/nope");
    expect((await useEvent()).value).toBeUndefined();
    setContentPages({});
    setRoutePath("/events/harvest-dinner");
    expect((await useEvent()).value).toBeUndefined();
  });
});

describe("useSelectedDay", () => {
  const EVENTS = [WORSHIP, SCHOOL, DINNER];

  // A Sunday afternoon at the church.
  beforeEach(() => {
    vi.useFakeTimers({
      now: new Date("2026-10-04T20:00:00Z"),
      toFake: ["Date"],
    });
  });

  it("is today until a day is picked, with its events from the earliest", () => {
    const { result } = withSetup(() => useSelectedDay(EVENTS));
    expect(result.selected.value).toBe("2026-10-04");
    expect(result.date.value).toBe("Sunday, October 4");
    expect(result.held.value).toEqual([SCHOOL, WORSHIP]);
  });

  it("is the day picked, with its events", () => {
    const { result } = withSetup(() => useSelectedDay(EVENTS));
    result.selected.value = "2026-10-24";
    expect(result.selected.value).toBe("2026-10-24");
    expect(result.date.value).toBe("Saturday, October 24");
    expect(result.held.value).toEqual([DINNER]);
    result.selected.value = "2026-10-05";
    expect(result.held.value).toEqual([]);
  });

  it("says the day in the route's locale", () => {
    setRoutePath("/es/events");
    const { result } = withSetup(() => useSelectedDay(EVENTS));
    expect(result.date.value).toBe("domingo, 4 de octubre");
  });

  it("follows the events it was handed", async () => {
    const events = ref<ChurchEvent[]>([]);
    const { result } = withSetup(() => useSelectedDay(events));
    expect(result.held.value).toEqual([]);
    events.value = EVENTS;
    await nextTick();
    expect(result.held.value).toEqual([SCHOOL, WORSHIP]);
  });
});

describe("useEventArticle", () => {
  const PAGE: PageItem = {
    title: "Worship Service",
    image: "/images/worship.jpg",
    body: document({ title: "Worship Service", image: "/images/worship.jpg" }),
  };

  const article = (event: ChurchEvent, page: PageItem | null = null) => {
    setAppConfig({ events: { image: "/images/church.jpg" } });
    const { result } = withSetup(() => useEventArticle(event, page));
    return {
      description: plain(result.description.value),
      image: result.image.value,
    };
  };

  it("describes the event by its days, its time and its note", () => {
    expect(
      article({ ...WORSHIP, note: "All welcome", weeks: [1, 3] }).description,
    ).toBe("Every first and third Sunday · 10:00 – 11:30 AM · All welcome");
    expect(article(DINNER).description).toBe(
      "Saturday, October 24 · 5:30 PM · Bring a dish",
    );
  });

  it("leaves out of the description what the event does not say", () => {
    expect(article({ ...OPEN_HOUSE, day: "saturday" }).description).toBe(
      "Every Saturday",
    );
    expect(article(OPEN_HOUSE).description).toBeUndefined();
  });

  it("shows the page's picture, and the church's until the page names one", () => {
    expect(article(WORSHIP, PAGE).image).toBe("/images/worship.jpg");
    expect(article(WORSHIP, { ...PAGE, image: undefined }).image).toBe(
      "/images/church.jpg",
    );
    expect(article(WORSHIP).image).toBe("/images/church.jpg");
  });

  it("follows the event and the page it was handed", async () => {
    setAppConfig({ events: { image: "/images/church.jpg" } });
    const event = ref<ChurchEvent>(WORSHIP);
    const page = ref<PageItem | null>(null);
    const { result } = withSetup(() => useEventArticle(event, page));
    event.value = DINNER;
    page.value = PAGE;
    await nextTick();
    expect(result.description.value).toContain("Saturday, October 24");
    expect(result.image.value).toBe("/images/worship.jpg");
  });
});
