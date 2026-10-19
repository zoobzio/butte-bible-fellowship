import { describe, expect, it } from "vitest";

import {
  EVENT_DAYS,
  churchEvent,
  churchEvents,
  eventDay,
  eventListing,
  eventRecord,
  eventTime,
} from "../../src/models/event";

const WEEKLY = {
  slug: "worship-service",
  title: "Worship Service",
  day: "sunday",
  start: "10:00",
};

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
      slug: "volunteer-work-fellowship",
      title: "Volunteer Work Fellowship",
      note: "Bring gloves.",
      summary: "Volunteers lend a hand with the work of the church.",
      body: {
        type: "root",
        children: [
          {
            type: "element",
            tagName: "p",
            properties: {},
            children: [{ type: "text", value: "Come along." }],
          },
        ],
      },
      image: "https://cdn.example.com/events/volunteer.jpg",
      location: "Bidwell Park",
      date: "2026-10-17",
      weeks: [1, 3],
      start: "08:00",
      end: "12:00",
    };
    expect(churchEvent.parse(event)).toEqual(event);
  });

  it("needs a slug, and one that would do in an address", () => {
    const { slug: _slug, ...unnamed } = WEEKLY;
    expect(churchEvent.safeParse(unnamed).success).toBe(false);
    expect(
      churchEvent.safeParse({ ...WEEKLY, slug: "Worship Service" }).success,
    ).toBe(false);
  });

  it("takes a body as a tree, never as the Markdown it was written as", () => {
    expect(
      churchEvent.safeParse({ ...WEEKLY, body: "## Sunday\n\nWe gather." })
        .success,
    ).toBe(false);
  });

  it("rejects an image that is not a URL", () => {
    expect(
      churchEvent.safeParse({ ...WEEKLY, image: "/events/worship.jpg" })
        .success,
    ).toBe(false);
  });

  it("carries no status: the site lists only the published", () => {
    expect(churchEvent.parse({ ...WEEKLY, status: "draft" })).toEqual(WEEKLY);
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
      churchEvent.safeParse({
        slug: "prayer",
        title: "Prayer",
        day: "wednesday",
      }).success,
    ).toBe(false);
  });
});

describe("churchEvents", () => {
  it("is a list of events", () => {
    expect(churchEvents.parse([WEEKLY])).toEqual([WEEKLY]);
    expect(churchEvents.safeParse([{ title: "Worship" }]).success).toBe(false);
  });
});

describe("eventRecord", () => {
  const RECORD = {
    id: 1,
    slug: "worship-service",
    title: "Worship Service",
    day: "sunday",
    start: "10:00",
    status: "published",
    createdAt: "2026-10-17T18:00:00.000Z",
    updatedAt: "2026-10-17T18:00:00.000Z",
  };

  it("needs what an event needs, and its id, status and timestamps", () => {
    expect(eventRecord.parse(RECORD)).toEqual(RECORD);
    for (const key of ["id", "status", "createdAt", "updatedAt"]) {
      const { [key]: _gone, ...without } = RECORD as Record<string, unknown>;
      expect(eventRecord.safeParse(without).success, key).toBe(false);
    }
  });

  it("accepts all an event can say, the body as the Markdown it was written as", () => {
    const value = {
      ...RECORD,
      note: "Bring gloves.",
      summary: "Volunteers lend a hand.",
      body: "## Work\n\nCome along.",
      image: "https://cdn.example.com/events/volunteer.jpg",
      location: "Bidwell Park",
      weeks: [1, 3],
      end: "12:00",
      status: "draft",
    };
    expect(eventRecord.parse(value)).toEqual(value);
  });

  it("takes a body as the Markdown, never as the tree the site renders", () => {
    expect(
      eventRecord.safeParse({ ...RECORD, body: { type: "root", children: [] } })
        .success,
    ).toBe(false);
  });

  it("names an event by a whole number from one", () => {
    expect(eventRecord.safeParse({ ...RECORD, id: 0 }).success).toBe(false);
  });
});

describe("eventListing", () => {
  it("is a page of records and how many there are in all", () => {
    const page = {
      items: [
        {
          id: 1,
          slug: "worship-service",
          title: "Worship Service",
          day: "sunday",
          start: "10:00",
          status: "published",
          createdAt: "2026-10-17T18:00:00.000Z",
          updatedAt: "2026-10-17T18:00:00.000Z",
        },
      ],
      total: 9,
    };
    expect(eventListing.parse(page)).toEqual(page);
    expect(eventListing.safeParse({ items: [WEEKLY], total: 1 }).success).toBe(
      false,
    );
  });
});
