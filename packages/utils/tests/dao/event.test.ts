import { eventBody } from "@bbf/schema";
import { describe, expect, it } from "vitest";

import { toEventArguments } from "../../src/dao/event";

describe("toEventArguments", () => {
  it("writes what a body leaves out as null", () => {
    const body = eventBody.parse({
      slug: "choir",
      title: "Choir Practice",
      day: "monday",
      start: "19:00",
    });
    expect(toEventArguments(body)).toEqual({
      slug: "choir",
      title: "Choir Practice",
      note: null,
      location: null,
      date: null,
      day: "monday",
      weeks: null,
      start: "19:00",
      end: null,
    });
  });

  it("carries every field a body says", () => {
    const body = eventBody.parse({
      slug: "stamp-ministry",
      title: "Stamp Ministry",
      note: "Bring stamps",
      location: "Fellowship Hall",
      day: "tuesday",
      weeks: [1, 3],
      start: "09:00",
      end: "11:00",
    });
    expect(toEventArguments(body)).toEqual({
      slug: "stamp-ministry",
      title: "Stamp Ministry",
      note: "Bring stamps",
      location: "Fellowship Hall",
      date: null,
      day: "tuesday",
      weeks: [1, 3],
      start: "09:00",
      end: "11:00",
    });
  });

  it("writes a one-off with its date and no day", () => {
    const body = eventBody.parse({
      slug: "christmas-eve",
      title: "Christmas Eve Service",
      date: "2026-12-24",
      start: "18:00",
    });
    expect(toEventArguments(body)).toMatchObject({
      date: "2026-12-24",
      day: null,
      weeks: null,
    });
  });
});
