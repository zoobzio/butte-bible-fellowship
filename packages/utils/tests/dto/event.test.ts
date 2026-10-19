import { churchEvent, eventRecord } from "@bbf/schema";
import { describe, expect, it } from "vitest";

import { toChurchEvent, toEventRecord } from "../../src/dto/event";

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

/** A row as `admin.events.fetch` returns it: every column, the timestamps as dates. */
const ADMIN_ROW = {
  ...WEEKLY,
  id: 3,
  body: null,
  date: null,
  status: "published" as const,
  created_at: new Date("2026-10-17T18:00:00Z"),
  updated_at: new Date("2026-10-18T09:30:00Z"),
};

describe("toEventRecord", () => {
  it("builds a weekly record, leaving out what the row has null in", () => {
    expect(toEventRecord(ADMIN_ROW)).toEqual({
      id: 3,
      slug: "worship-service",
      title: "Worship Service",
      day: "sunday",
      start: "10:00",
      end: "11:30",
      status: "published",
      createdAt: "2026-10-17T18:00:00.000Z",
      updatedAt: "2026-10-18T09:30:00.000Z",
    });
  });

  it("builds a one-off, the body as the Markdown it was written as", () => {
    expect(
      toEventRecord({
        ...ADMIN_ROW,
        ...ONE_OFF,
        day: null,
        weeks: null,
        body: "## Eve\n\nCandles.",
        status: "draft",
      }),
    ).toEqual({
      id: 3,
      slug: "christmas-eve",
      title: "Christmas Eve Service",
      note: "Candlelight",
      summary: "A candlelight service on Christmas Eve.",
      body: "## Eve\n\nCandles.",
      image: "https://cdn.example.com/events/christmas-eve.jpg",
      location: "Pillsbury Road",
      date: "2026-12-24",
      start: "18:00",
      status: "draft",
      createdAt: "2026-10-17T18:00:00.000Z",
      updatedAt: "2026-10-18T09:30:00.000Z",
    });
  });

  it("lists the weeks a repeating event is held in", () => {
    expect(toEventRecord({ ...ADMIN_ROW, weeks: [1, 3] }).weeks).toEqual([
      1, 3,
    ]);
  });

  it("builds what the schema accepts", () => {
    expect(eventRecord.safeParse(toEventRecord(ADMIN_ROW)).success).toBe(true);
  });
});
