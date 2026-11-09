import { eventBody } from "@bbf/schema";
import { describe, expect, it } from "vitest";

import { toEventArguments } from "../../src/dao/event";

describe("toEventArguments", () => {
  it("writes what a body leaves out as null, held once", () => {
    const body = eventBody.parse({
      slug: "christmas-eve",
      title: "Christmas Eve Service",
      date: "2026-12-24",
      start: "18:00",
    });
    expect(toEventArguments(body)).toEqual({
      slug: "christmas-eve",
      title: "Christmas Eve Service",
      summary: null,
      date: "2026-12-24",
      recurring: false,
      weeks: null,
      start: "18:00",
      end: null,
    });
  });

  it("carries every field a body says", () => {
    const body = eventBody.parse({
      slug: "stamp-ministry",
      title: "Stamp Ministry",
      summary: "One of the ways we serve.",
      date: "2026-01-06",
      recurring: true,
      weeks: [1, 3],
      start: "09:00",
      end: "11:00",
    });
    expect(toEventArguments(body)).toEqual({
      slug: "stamp-ministry",
      title: "Stamp Ministry",
      summary: "One of the ways we serve.",
      date: "2026-01-06",
      recurring: true,
      weeks: [1, 3],
      start: "09:00",
      end: "11:00",
    });
  });
});
