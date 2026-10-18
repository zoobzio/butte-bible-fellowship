import { churchEvent } from "@bbf/schema";
import { describe, expect, it } from "vitest";

import { toChurchEvent } from "../../src/dto/event";

/** A row as `web.events.weekly` returns it: no `date` or `body` column at all. */
const WEEKLY = {
  slug: "worship-service",
  title: "Worship Service",
  note: null,
  summary: null,
  image: null,
  location: null,
  day: "sunday" as const,
  weeks: null,
  start_time: "10:00:00",
  end_time: "11:30:00",
};

/** A row as `web.events.upcoming` returns it: no `day`, `weeks` or `body` column. */
const ONE_OFF = {
  slug: "christmas-eve",
  title: "Christmas Eve Service",
  note: "Candlelight",
  summary: "A candlelight service on Christmas Eve.",
  image: "https://cdn.example.com/events/christmas-eve.jpg",
  location: "Pillsbury Road",
  date: "2026-12-24",
  start_time: "18:00:00",
  end_time: null,
};

describe("toChurchEvent", () => {
  it("builds a weekly event, leaving out what the row has null in", () => {
    expect(toChurchEvent(WEEKLY)).toEqual({
      slug: "worship-service",
      title: "Worship Service",
      day: "sunday",
      start: "10:00",
      end: "11:30",
    });
  });

  it("builds a one-off from a row without a day", () => {
    expect(toChurchEvent(ONE_OFF)).toEqual({
      slug: "christmas-eve",
      title: "Christmas Eve Service",
      note: "Candlelight",
      summary: "A candlelight service on Christmas Eve.",
      image: "https://cdn.example.com/events/christmas-eve.jpg",
      location: "Pillsbury Road",
      date: "2026-12-24",
      start: "18:00",
    });
  });

  it("serves the body as the tree the app renders, not the Markdown", () => {
    const event = toChurchEvent({
      ...WEEKLY,
      body: "## Sunday\n\nWe gather.",
    });
    expect(event.body).toEqual({
      type: "root",
      children: [
        {
          type: "element",
          tagName: "h2",
          properties: { id: "sunday" },
          children: [{ type: "text", value: "Sunday" }],
        },
        { type: "text", value: "\n" },
        {
          type: "element",
          tagName: "p",
          properties: {},
          children: [{ type: "text", value: "We gather." }],
        },
      ],
    });
    expect(churchEvent.safeParse(event).success).toBe(true);
    expect(toChurchEvent({ ...WEEKLY, body: null }).body).toBeUndefined();
  });

  it("keeps the weeks a repeating event is held in, dropping a null", () => {
    expect(toChurchEvent({ ...WEEKLY, weeks: [1, 3] }).weeks).toEqual([1, 3]);
    expect(toChurchEvent({ ...WEEKLY, weeks: [1, null, 3] }).weeks).toEqual([
      1, 3,
    ]);
  });

  it("writes the times to the minute, as the model says them", () => {
    const event = toChurchEvent({ ...WEEKLY, start_time: "08:30:00" });
    expect(event.start).toBe("08:30");
    expect(event.end).toBe("11:30");
  });

  it("takes an admin row, whose extra columns go nowhere", () => {
    const row = {
      ...WEEKLY,
      id: 7,
      date: null,
      body: null,
      status: "published" as const,
      created_at: new Date(),
      updated_at: new Date(),
    };
    expect(toChurchEvent(row)).not.toHaveProperty("id");
    expect(toChurchEvent(row)).not.toHaveProperty("status");
    expect(toChurchEvent(row)).not.toHaveProperty("created_at");
  });

  it("builds what the schema accepts", () => {
    expect(churchEvent.safeParse(toChurchEvent(WEEKLY)).success).toBe(true);
    expect(churchEvent.safeParse(toChurchEvent(ONE_OFF)).success).toBe(true);
  });
});
