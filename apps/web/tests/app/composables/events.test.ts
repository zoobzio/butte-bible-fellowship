import { afterEach, describe, expect, it, vi } from "vitest";

import { useState } from "#imports";
import { useToday } from "~/composables/events";
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
