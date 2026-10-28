import { describe, expect, it } from "vitest";

import {
  eventBody,
  eventId,
  eventPath,
  eventsQuery,
} from "../../src/input/event";

const WEEKLY = {
  slug: "worship-service",
  title: "Worship Service",
  day: "sunday",
  start: "10:00",
};
const ONCE = {
  slug: "work-day",
  title: "Work Day",
  date: "2026-10-17",
  start: "08:00",
};

const issues = (value: unknown) =>
  eventBody
    .safeParse(value)
    .error?.issues.map((issue) => issue.path.join(".")) ?? [];

describe("eventId", () => {
  it("names an event by its row's number, as the address writes it", () => {
    expect(eventId.parse({ id: "7" })).toEqual({ id: 7 });
    expect(eventId.safeParse({ id: "0" }).success).toBe(false);
    expect(eventId.safeParse({ id: "worship-service" }).success).toBe(false);
  });
});

describe("eventPath", () => {
  it("names an event by its slug", () => {
    expect(eventPath.parse({ slug: "worship-service" })).toEqual({
      slug: "worship-service",
    });
  });

  it("rejects a slug that would not do in an address", () => {
    expect(eventPath.safeParse({ slug: "Worship Service" }).success).toBe(
      false,
    );
    expect(eventPath.safeParse({ slug: "" }).success).toBe(false);
    expect(eventPath.safeParse({}).success).toBe(false);
  });
});

describe("eventsQuery", () => {
  it("takes no query at all", () => {
    expect(eventsQuery.parse({})).toEqual({});
  });

  it("takes the date to list from", () => {
    expect(eventsQuery.parse({ from: "2026-10-17" })).toEqual({
      from: "2026-10-17",
    });
    expect(eventsQuery.safeParse({ from: "10/17/2026" }).success).toBe(false);
  });
});

describe("eventBody", () => {
  it("writes an event as a draft when not told otherwise", () => {
    expect(eventBody.parse(WEEKLY)).toEqual({ ...WEEKLY, status: "draft" });
  });

  it("accepts an event held once, with all it can say", () => {
    const value = {
      ...ONCE,
      note: "Bring gloves.",
      summary: "A morning's work on the grounds.",
      body: "## Work Day\n\nBring gloves.",
      image: "https://cdn.example.com/events/work-day.jpg",
      location: "Bidwell Park",
      end: "12:00",
      status: "published",
    };
    expect(eventBody.parse(value)).toEqual(value);
  });

  it("rejects a status that is not one, and an image that is not a URL", () => {
    expect(issues({ ...WEEKLY, status: "hidden" })).toEqual(["status"]);
    expect(issues({ ...WEEKLY, image: "/events/worship.jpg" })).toEqual([
      "image",
    ]);
  });

  it("insists on a date or a day, never both and never neither", () => {
    expect(issues({ ...WEEKLY, date: "2026-10-17" })).toEqual(["day"]);
    expect(issues({ slug: "x", title: "X", start: "10:00" })).toEqual(["date"]);
  });

  it("lets only a repeating event pick its weeks", () => {
    expect(eventBody.parse({ ...WEEKLY, weeks: [1, 3] })).toEqual({
      ...WEEKLY,
      weeks: [1, 3],
      status: "draft",
    });
    expect(issues({ ...ONCE, weeks: [1, 3] })).toEqual(["weeks"]);
  });

  it("insists an end comes after its start", () => {
    expect(issues({ ...WEEKLY, end: "10:00" })).toEqual(["end"]);
    expect(issues({ ...WEEKLY, end: "09:30" })).toEqual(["end"]);
    expect(eventBody.safeParse({ ...WEEKLY, end: "11:30" }).success).toBe(true);
  });

  it("needs a slug, a title and a start", () => {
    expect(issues({ title: "X", day: "sunday", start: "10:00" })).toEqual([
      "slug",
    ]);
    expect(
      issues({ slug: "x", title: "", day: "sunday", start: "10:00" }),
    ).toEqual(["title"]);
    expect(issues({ slug: "x", title: "X", day: "sunday" })).toEqual(["start"]);
  });
});
