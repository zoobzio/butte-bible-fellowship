import { describe, expect, it, vi } from "vitest";

import { createCalendar } from "#imports";
import { withSetup } from "@bbf/nuxt/testing/mount";
import { useCalendarRequest } from "~/composables/calendar";

describe("useCalendarRequest", () => {
  it("fetches the days the calendar shows on every load, the first through its init", async () => {
    const fetch = vi.fn(async () => []);
    const useCalendar = createCalendar<never[], unknown>("calendar-request", {
      read: (entries) => entries,
      write: (entries) => entries,
      fetch,
    });
    const calendar = withSetup(() => useCalendar()).result;
    expect(calendar.initialized).toBe(false);
    await useCalendarRequest(calendar);
    expect(calendar.initialized).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(1);
    await useCalendarRequest(withSetup(() => useCalendar()).result);
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
