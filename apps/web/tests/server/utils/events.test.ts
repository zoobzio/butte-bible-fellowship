import { describe, expect, it } from "vitest";

import { churchDate } from "~~/server/utils/events";

describe("churchDate", () => {
  it("is the date at the church, whatever the zone it is asked in", () => {
    expect(churchDate(new Date("2026-10-04T03:00:00Z"))).toBe("2026-10-03");
    expect(churchDate(new Date("2026-10-04T13:00:00Z"))).toBe("2026-10-04");
  });
});
