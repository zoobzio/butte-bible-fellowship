import { afterEach, describe, expect, it, vi } from "vitest";

import type { ChurchEvent } from "#shared/types/events";

import { setRoutePath, useState } from "#imports";
import { useEventDays, useEventTime, useToday } from "~/composables/events";
import { withSetup } from "#test/support/mount";

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
