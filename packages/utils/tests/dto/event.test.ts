import { churchEvent, eventRecord } from "@bbf/schema";
import { describe, expect, it } from "vitest";

import { toChurchEvent, toEventDay, toEventRecord } from "../../src/dto/event";

const BODY = {
  type: "root",
  children: [
    {
      type: "element",
      tagName: "p",
      properties: {},
      children: [{ type: "text", value: "We gather." }],
    },
  ],
};

const WEEKLY = {
  slug: "worship-service",
  title: "Worship Service",
  summary: null,
  image: null,
  date: "2026-01-04",
  recurring: true,
  weeks: null,
  start_time: "10:00:00",
  end_time: "11:30:00",
};

const ONE_OFF = {
  slug: "christmas-eve",
  title: "Christmas Eve Service",
  summary: "A candlelight service on Christmas Eve.",
  image: "https://cdn.example.com/events/christmas-eve.jpg",
  date: "2026-12-24",
  recurring: false,
  weeks: null,
  start_time: "18:00:00",
  end_time: null,
};

describe("toEventDay", () => {
  it("names the day of the week a date falls on, in no time zone", () => {
    expect(toEventDay("2026-01-04")).toBe("sunday");
    expect(toEventDay("2026-01-06")).toBe("tuesday");
    expect(toEventDay("2026-01-10")).toBe("saturday");
    expect(toEventDay("2026-12-24")).toBe("thursday");
  });
});

describe("toChurchEvent", () => {
  it("builds a recurring event by the day of the week of its date, and no date", () => {
    expect(toChurchEvent(WEEKLY)).toEqual({
      slug: "worship-service",
      title: "Worship Service",
      day: "sunday",
      start: "10:00",
      end: "11:30",
    });
  });

  it("builds a one-off by its date, and no day", () => {
    expect(toChurchEvent(ONE_OFF)).toEqual({
      slug: "christmas-eve",
      title: "Christmas Eve Service",
      summary: "A candlelight service on Christmas Eve.",
      image: "https://cdn.example.com/events/christmas-eve.jpg",
      date: "2026-12-24",
      start: "18:00",
    });
  });

  it("serves the body as the tree it was written as", () => {
    const event = toChurchEvent({ ...WEEKLY, body: BODY });
    expect(event.body).toEqual(BODY);
    expect(churchEvent.safeParse(event).success).toBe(true);
    expect(toChurchEvent({ ...WEEKLY, body: null }).body).toBeUndefined();
    expect(toChurchEvent(WEEKLY).body).toBeUndefined();
  });

  it("refuses a body that is no tree", () => {
    expect(() => toChurchEvent({ ...WEEKLY, body: "## Sunday" })).toThrow();
  });

  it("keeps the weeks a recurring event is held in, dropping a null", () => {
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
      body: null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    expect(toChurchEvent(row)).not.toHaveProperty("id");
    expect(toChurchEvent(row)).not.toHaveProperty("recurring");
    expect(toChurchEvent(row)).not.toHaveProperty("created_at");
  });

  it("builds what the schema accepts", () => {
    expect(churchEvent.safeParse(toChurchEvent(WEEKLY)).success).toBe(true);
    expect(churchEvent.safeParse(toChurchEvent(ONE_OFF)).success).toBe(true);
  });
});

const ADMIN_ROW = {
  ...WEEKLY,
  id: 3,
  body: null,
  created_at: new Date("2026-10-17T18:00:00Z"),
  updated_at: new Date("2026-10-18T09:30:00Z"),
};

describe("toEventRecord", () => {
  it("builds a recurring record, with its date and the day it falls on, leaving out what the row has null in", () => {
    expect(toEventRecord(ADMIN_ROW)).toEqual({
      id: 3,
      slug: "worship-service",
      title: "Worship Service",
      date: "2026-01-04",
      day: "sunday",
      recurring: true,
      start: "10:00",
      end: "11:30",
      createdAt: "2026-10-17T18:00:00.000Z",
      updatedAt: "2026-10-18T09:30:00.000Z",
    });
  });

  it("carries all the row says, the body as the tree it was written as", () => {
    const record = toEventRecord({
      ...ADMIN_ROW,
      ...ONE_OFF,
      body: BODY,
      weeks: null,
    });
    expect(record).toMatchObject({
      summary: "A candlelight service on Christmas Eve.",
      body: BODY,
      image: "https://cdn.example.com/events/christmas-eve.jpg",
      date: "2026-12-24",
      day: "thursday",
      recurring: false,
      start: "18:00",
    });
    expect(record.end).toBeUndefined();
    expect(toEventRecord({ ...ADMIN_ROW, weeks: [1, null, 3] }).weeks).toEqual([
      1, 3,
    ]);
  });

  it("builds what the schema accepts", () => {
    expect(eventRecord.safeParse(toEventRecord(ADMIN_ROW)).success).toBe(true);
    expect(
      eventRecord.safeParse(toEventRecord({ ...ADMIN_ROW, body: BODY }))
        .success,
    ).toBe(true);
  });
});
