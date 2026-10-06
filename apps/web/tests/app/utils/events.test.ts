import { describe, expect, it } from "vitest";

import type { ChurchEvent } from "#shared/types/events";

import {
  addDays,
  addMonths,
  calendar,
  churchDate,
  eventsOn,
  minutes,
  monthOf,
  occursOn,
  pathOf,
  slugOf,
  toTime,
} from "~/utils/events";

describe("churchDate", () => {
  it("is the date at the church, not where it is asked", () => {
    // Early on the 5th in UTC is still the evening of the 4th in California.
    expect(churchDate(new Date("2026-10-05T03:00:00Z"))).toBe("2026-10-04");
    expect(churchDate(new Date("2026-10-05T12:00:00Z"))).toBe("2026-10-05");
  });
});

describe("date arithmetic", () => {
  it("adds days across months, years and daylight saving", () => {
    expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
    expect(addDays("2026-01-01", -1)).toBe("2025-12-31");
    expect(addDays("2026-10-31", 2)).toBe("2026-11-02");
  });

  it("adds months, landing on the first of the month", () => {
    expect(addMonths("2026-10-31", 1)).toBe("2026-11-01");
    expect(addMonths("2026-01-15", -1)).toBe("2025-12-01");
    expect(addMonths("2026-10-17", 0)).toBe("2026-10-01");
  });
});

describe("monthOf", () => {
  it("gives a date's month in whole weeks, Sunday to Saturday", () => {
    // October 2026 starts on a Thursday and ends on a Saturday.
    const dates = monthOf("2026-10-17");
    expect(dates.length).toBe(35);
    expect(dates[0]).toBe("2026-09-27");
    expect(dates[dates.length - 1]).toBe("2026-10-31");
  });

  it("gives a month as many weeks as it touches", () => {
    // February 2026 is four whole weeks; August 2026 touches six.
    expect(monthOf("2026-02-10").length).toBe(28);
    expect(monthOf("2026-08-10").length).toBe(42);
  });
});

describe("minutes", () => {
  it("reads a time of day on a 24-hour clock", () => {
    expect(minutes("00:00")).toBe(0);
    expect(minutes("08:45")).toBe(525);
    expect(minutes("7:00")).toBe(420);
    expect(minutes("13:00")).toBe(780);
  });

  it("is null for what is not a time", () => {
    for (const time of [undefined, "", "noon", "8:45am", "24:00", "10:60"]) {
      expect(minutes(time), String(time)).toBeNull();
    }
  });
});

describe("occursOn", () => {
  const event = (fields: Partial<ChurchEvent>): ChurchEvent => ({
    title: "Event",
    start: "10:00",
    ...fields,
  });

  it("holds a dated event on its date alone", () => {
    const dated = event({ date: "2026-12-24" });
    expect(occursOn(dated, "2026-12-24")).toBe(true);
    expect(occursOn(dated, "2026-12-25")).toBe(false);
    expect(occursOn(dated, "2027-12-24")).toBe(false);
  });

  it("reads a date written as a timestamp", () => {
    const dated = event({ date: "2026-12-24T00:00:00.000Z" });
    expect(occursOn(dated, "2026-12-24")).toBe(true);
  });

  it("holds a dated event on its date whatever day it also names", () => {
    // The 24th of December 2026 is a Thursday.
    const dated = event({ date: "2026-12-24", day: "sunday" });
    expect(occursOn(dated, "2026-12-24")).toBe(true);
    expect(occursOn(dated, "2026-12-27")).toBe(false);
  });

  it("holds a weekly event on its day of every week", () => {
    const weekly = event({ day: "sunday" });
    expect(occursOn(weekly, "2026-10-04")).toBe(true);
    expect(occursOn(weekly, "2026-10-11")).toBe(true);
    expect(occursOn(weekly, "2026-10-05")).toBe(false);
  });

  it("holds an event in the weeks of the month it names", () => {
    // October 2026's Tuesdays: the 6th, 13th, 20th and 27th.
    const some = event({ day: "tuesday", weeks: [1, 3] });
    expect(
      ["2026-10-06", "2026-10-13", "2026-10-20", "2026-10-27"].map((date) =>
        occursOn(some, date),
      ),
    ).toEqual([true, false, true, false]);
  });

  it("holds an event that names no weeks every week", () => {
    expect(occursOn(event({ day: "tuesday", weeks: [] }), "2026-10-13")).toBe(
      true,
    );
  });

  it("never holds an event with neither a date nor a day", () => {
    expect(occursOn(event({}), "2026-10-04")).toBe(false);
  });
});

describe("eventsOn", () => {
  const EVENTS: ChurchEvent[] = [
    { title: "Worship", day: "sunday", start: "10:00" },
    { title: "Sunday School", day: "sunday", start: "08:45" },
    { title: "Potluck", date: "2026-10-04", start: "12:00" },
    { title: "Open House", day: "sunday", start: "all day" },
  ];

  it("gives the events held on a date, earliest first", () => {
    expect(eventsOn(EVENTS, "2026-10-04").map((event) => event.title)).toEqual([
      "Open House",
      "Sunday School",
      "Worship",
      "Potluck",
    ]);
    expect(eventsOn(EVENTS, "2026-10-05")).toEqual([]);
  });

  it("leaves the list it was handed in the order it came", () => {
    eventsOn(EVENTS, "2026-10-04");
    expect(EVENTS[0]!.title).toBe("Worship");
  });

  it("gives each day of a date's month its events", () => {
    const days = calendar(EVENTS, "2026-10-17");
    expect(days.map((day) => day.date)).toEqual(monthOf("2026-10-17"));
    expect(days.map((day) => day.events.length).slice(7, 14)).toEqual([
      4, 0, 0, 0, 0, 0, 0,
    ]);
  });
});

describe("toTime", () => {
  it("is a time of day as a moment, read in UTC", () => {
    expect(toTime(525).toISOString()).toBe("1970-01-01T08:45:00.000Z");
  });
});

describe("slugOf", () => {
  const event = (title: string, slug?: string): ChurchEvent => ({
    title,
    slug,
    start: "10:00",
  });

  it("is the event's own slug when it has one", () => {
    expect(slugOf(event("Servicio de Adoración", "worship-service"))).toBe(
      "worship-service",
    );
  });

  it("is made from the title otherwise: lowercase, plain, hyphenated", () => {
    expect(slugOf(event("Worship Service"))).toBe("worship-service");
    expect(slugOf(event("Men’s Breakfast & Bible Study"))).toBe(
      "mens-breakfast-bible-study",
    );
    expect(slugOf(event("Servicio de Adoración"))).toBe(
      "servicio-de-adoracion",
    );
    expect(slugOf(event("  Stamp Ministry (1st & 3rd)  "))).toBe(
      "stamp-ministry-1st-3rd",
    );
  });

  it("puts the event's page under the events page", () => {
    expect(pathOf(event("Worship Service"))).toBe("/events/worship-service");
  });
});
