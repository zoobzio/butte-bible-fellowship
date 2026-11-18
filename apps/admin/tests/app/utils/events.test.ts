import { describe, expect, it } from "vitest";

import { eventWindow } from "@bbf/schema";
import { DINNER, WORSHIP } from "#test/support/records";
import { toDuration, toEntry, toWindowQuery } from "~/utils/events";

const TIME_ZONE = "America/Los_Angeles";

describe("toDuration", () => {
  it("is the time from an event's start to its end, as a calendar reads it", () => {
    expect(toDuration("10:00", "11:30")).toBe("PT1H30M");
    expect(toDuration("08:45", "09:30")).toBe("PT0H45M");
    expect(toDuration("00:00", "23:59")).toBe("PT23H59M");
  });
});

describe("toEntry", () => {
  it("reads a one-off as an entry held on its date from its start, known by its row's number", () => {
    expect(toEntry(DINNER, TIME_ZONE)).toEqual({
      "@type": "Event",
      uid: "4",
      updated: "2026-10-17T18:00:00.000Z",
      title: "Harvest Dinner",
      start: "2026-10-24T17:30:00",
      timeZone: TIME_ZONE,
    });
  });

  it("reads a recurring event's weeks as the nth of its day in each month, and carries its summary and how long it runs", () => {
    expect(toEntry(WORSHIP, TIME_ZONE)).toEqual({
      "@type": "Event",
      uid: "3",
      updated: "2026-10-18T09:30:00.000Z",
      title: "Worship Service",
      description: "We gather on Sunday morning.",
      start: "2026-01-04T10:00:00",
      timeZone: TIME_ZONE,
      duration: "PT1H30M",
      recurrenceRule: {
        frequency: "monthly",
        byDay: [
          { day: "su", nthOfPeriod: 1 },
          { day: "su", nthOfPeriod: 3 },
        ],
      },
    });
  });

  it("reads a recurring event that picks no weeks as held every week", () => {
    for (const weeks of [undefined, []]) {
      expect(toEntry({ ...WORSHIP, weeks }, TIME_ZONE).recurrenceRule).toEqual({
        frequency: "weekly",
      });
    }
  });
});

describe("toWindowQuery", () => {
  const days = ["2026-09-27", "2026-09-28", "2026-10-31"];

  it("asks for the first and the last of the days shown, and nothing more of an empty search", () => {
    expect(toWindowQuery(days, { query: "", filters: [] })).toEqual({
      from: "2026-09-27",
      to: "2026-10-31",
    });
  });

  it("names the free text and each filter as the API does", () => {
    const query = toWindowQuery(days, {
      query: "dinner",
      filters: [
        { key: "recurring", value: "false" },
        { key: "day", op: "not", value: "sunday" },
        { key: "title", op: "starts with", value: "harvest" },
      ],
    });
    expect(query).toEqual({
      from: "2026-09-27",
      to: "2026-10-31",
      q: "dinner",
      recurring: "false",
      dayNot: "sunday",
      titleStartsWith: "harvest",
    });
    expect(eventWindow.safeParse(query).success).toBe(true);
  });
});
