import { describe, expect, it } from "vitest";

import {
  EVENT_DAYS,
  churchEvent,
  eventDay,
  eventTime,
} from "../../src/models/event";

const WEEKLY = { title: "Worship Service", day: "sunday", start: "10:00" };

describe("eventDay", () => {
  it("accepts each day of the week", () => {
    for (const day of EVENT_DAYS) expect(eventDay.parse(day)).toBe(day);
  });

  it("rejects what is not a day", () => {
    expect(eventDay.safeParse("Sunday").success).toBe(false);
  });
});

describe("eventTime", () => {
  it("accepts a time as HH:MM", () => {
    expect(eventTime.parse("13:00")).toBe("13:00");
  });

  it("rejects a time said any other way", () => {
    expect(eventTime.safeParse("1pm").success).toBe(false);
    expect(eventTime.safeParse("13:00:00").success).toBe(false);
  });
});

describe("churchEvent", () => {
  it("accepts a weekly event with only what it needs", () => {
    expect(churchEvent.parse(WEEKLY)).toEqual(WEEKLY);
  });

  it("accepts an event held once, with all it can say", () => {
    const event = {
      title: "Volunteer Work Fellowship",
      slug: "volunteer-work-fellowship",
      note: "Bring gloves.",
      location: "Bidwell Park",
      date: "2026-10-17",
      weeks: [1, 3],
      start: "08:00",
      end: "12:00",
    };
    expect(churchEvent.parse(event)).toEqual(event);
  });

  it("rejects a slug that would not do in an address", () => {
    expect(
      churchEvent.safeParse({ ...WEEKLY, slug: "Worship Service" }).success,
    ).toBe(false);
  });

  it("rejects a date that is not YYYY-MM-DD", () => {
    expect(
      churchEvent.safeParse({ ...WEEKLY, date: "10/17/2026" }).success,
    ).toBe(false);
  });

  it("rejects a time that is not HH:MM", () => {
    expect(churchEvent.safeParse({ ...WEEKLY, start: "10am" }).success).toBe(
      false,
    );
  });

  it("rejects a week outside the month's five", () => {
    expect(churchEvent.safeParse({ ...WEEKLY, weeks: [0] }).success).toBe(
      false,
    );
    expect(churchEvent.safeParse({ ...WEEKLY, weeks: [6] }).success).toBe(
      false,
    );
    expect(churchEvent.safeParse({ ...WEEKLY, weeks: [1.5] }).success).toBe(
      false,
    );
  });

  it("rejects an event without a start", () => {
    expect(
      churchEvent.safeParse({ title: "Prayer", day: "wednesday" }).success,
    ).toBe(false);
  });
});
