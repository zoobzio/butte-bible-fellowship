import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";

import { EVENT_VIEW_COLUMNS, eventView, eventWindow } from "@bbf/schema";
import { DINNER, WORSHIP } from "#test/support/records";
import { withSetup } from "@bbf/nuxt/testing/mount";
import { useEventsCalendar } from "~/composables/events/calendar";
import { EVENT_VIEWS } from "~/constants/events";
import { TIME_ZONE } from "#layers/bbf/shared/constants/time";

const TEXT_OPERATORS = [
  "contains",
  "not contains",
  "starts with",
  "ends with",
  "is",
  "not",
];

/* A Thursday of October 2026, mid-morning in the church's own time. */
beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"], now: new Date("2026-10-15T17:00:00Z") });
});

afterEach(() => {
  vi.useRealTimers();
});

/** The calendar over the admin's API answering with the events given. */
const mounted = (records: unknown = [WORSHIP, DINNER]) => {
  const fetch = vi.fn(async () => records);
  vi.stubGlobal("$fetch", fetch);
  return { fetch, calendar: withSetup(() => useEventsCalendar()).result };
};

describe("useEventsCalendar", () => {
  it("is the events calendar, in the church's time zone, a month at first, a week or the agenda, its weeks from Sunday", () => {
    const { calendar } = mounted();
    expect(calendar.id).toBe("events");
    expect(calendar.context.timeZone).toBe(TIME_ZONE);
    expect(calendar.views).toEqual(["month", "week", "agenda"]);
    expect(calendar.view).toBe("month");
    expect(calendar.today).toBe("2026-10-15");
    expect(calendar.date).toBe("2026-10-15");
    expect(calendar.days[0]).toBe("2026-09-27");
    expect(calendar.days.at(-1)).toBe("2026-10-31");
  });

  it("searches by the fields the API filters the events by, each named by the prose, and by the text", () => {
    const { query, searchable } = mounted().calendar;
    expect(searchable).toBe(true);
    expect(Object.keys(query.fields)).toEqual([...EVENT_VIEW_COLUMNS]);
    expect(Object.values(query.fields).map((field) => field.label)).toEqual([
      "Title",
      "Day",
      "Repeats weekly",
      "Slug",
      "Summary",
      "Image URL",
    ]);
    expect(query.literals).toEqual({
      text: { label: "Search", open: '"', close: '"' },
    });
    for (const key of ["title", "slug", "summary", "image"]) {
      expect(query.fields[key]?.operators, key).toEqual(TEXT_OPERATORS);
    }
    expect(query.fields.title?.values).toBeUndefined();
    expect(query.fields.summary?.values).toEqual(["present", "missing"]);
    expect(query.fields.recurring?.values).toEqual(["true", "false"]);
    expect(query.fields.day?.values).toHaveLength(7);
    expect(query.fields.day?.operators).toEqual(["is", "not"]);
    // The days the calendar shows are what it is asked for.
    expect(query.fields.date).toBeUndefined();
  });

  it("asks the API for nothing its query refuses", () => {
    const keys = Object.keys(eventWindow.shape);
    for (const field of Object.keys(mounted().calendar.query.fields)) {
      expect(
        keys.some((key) => key.startsWith(field)),
        field,
      ).toBe(true);
    }
  });

  it("fetches the events held within the days it shows, and lays each out when it is held", async () => {
    const { calendar, fetch } = mounted();
    await calendar.init();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith("/api/events/held", {
      query: { from: "2026-09-27", to: "2026-10-31" },
    });
    // The first and third Sundays of the month, and the one Saturday.
    expect(
      calendar.occurrences.map(({ uid, start, end }) => [uid, start, end]),
    ).toEqual([
      ["3", "2026-10-04T17:00:00Z", "2026-10-04T18:30:00Z"],
      ["3", "2026-10-18T17:00:00Z", "2026-10-18T18:30:00Z"],
      ["4", "2026-10-25T00:30:00Z", "2026-10-25T00:30:00Z"],
    ]);
    expect(
      calendar.occurrencesOn("2026-10-24").map(({ entry }) => entry.title),
    ).toEqual(["Harvest Dinner"]);
  });

  it("asks again for the days it moves to, and for the ones another view shows", async () => {
    const { calendar, fetch } = mounted();
    await calendar.init();
    calendar.next();
    await flushPromises();
    expect(fetch).toHaveBeenLastCalledWith("/api/events/held", {
      query: { from: "2026-11-01", to: "2026-12-05" },
    });
    // A recurring event is held from its date on, whatever the month.
    expect(
      calendar.occurrences.map(({ uid, start }) => [uid, start.slice(0, 10)]),
    ).toEqual([
      ["3", "2026-11-01"],
      ["3", "2026-11-15"],
    ]);
    calendar.show("week");
    await flushPromises();
    expect(fetch).toHaveBeenLastCalledWith("/api/events/held", {
      query: { from: "2026-11-15", to: "2026-11-21" },
    });
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it("searches the days it shows by the text and the filters the search box commits, as the API names each", async () => {
    const { calendar, fetch } = mounted([DINNER]);
    await calendar.init();
    calendar.query.add({ kind: "literal", key: "text", value: "dinner" });
    calendar.query.add({ kind: "filter", key: "recurring", value: "false" });
    calendar.query.add({
      kind: "filter",
      key: "day",
      op: "not",
      value: "sunday",
    });
    calendar.query.add({
      kind: "filter",
      key: "image",
      op: "is",
      value: "missing",
    });
    await flushPromises();
    expect(fetch).toHaveBeenLastCalledWith("/api/events/held", {
      query: {
        from: "2026-09-27",
        to: "2026-10-31",
        q: "dinner",
        recurringIs: "false",
        dayNot: "sunday",
        imageIs: "missing",
      },
    });
    expect(calendar.occurrences.map(({ uid }) => uid)).toEqual(["4"]);
  });

  it("starts as the view the admin starts with holds it", () => {
    const [all] = EVENT_VIEWS;
    expect(EVENT_VIEWS).toHaveLength(1);
    expect(all).toMatchObject({ id: "all", name: "admin.events.allView" });
    expect(all?.payload).toEqual(mounted().calendar.snapshot());
    expect(eventView.parse(all?.payload)).toEqual(all?.payload);
  });
});
