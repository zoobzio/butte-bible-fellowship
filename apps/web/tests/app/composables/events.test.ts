import { afterEach, describe, expect, it, vi } from "vitest";

import { setRoutePath, useState } from "#imports";
import { useEventTime, useToday } from "~/composables/events";
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
