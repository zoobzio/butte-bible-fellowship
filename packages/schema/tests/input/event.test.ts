import { describe, expect, it } from "vitest";

import {
  EVENT_IMAGE_SIZE,
  EVENT_IMAGE_TYPES,
  EVENT_SORT_KEYS,
  EVENT_WEEKS,
  eventArticle,
  eventBody,
  eventForm,
  eventId,
  eventImage,
  eventPath,
  eventQuery,
  eventsQuery,
} from "../../src/input/event";

const WEEKLY = {
  slug: "worship-service",
  title: "Worship Service",
  date: "2026-01-04",
  recurring: true,
  start: "10:00",
};
const ONCE = {
  slug: "work-day",
  title: "Work Day",
  date: "2026-10-17",
  recurring: false,
  start: "08:00",
};

const ARTICLE = {
  type: "root",
  children: [
    {
      type: "element",
      tagName: "p",
      properties: {},
      children: [{ type: "text", value: "Bring gloves." }],
    },
  ],
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
  it("writes an event held once, on its date, when not told it recurs", () => {
    const { recurring: _, ...dated } = ONCE;
    expect(eventBody.parse(dated)).toEqual(ONCE);
  });

  it("accepts all an event's details can say", () => {
    const value = {
      ...WEEKLY,
      summary: "We gather on Sunday morning.",
      weeks: [1, 3],
      end: "11:30",
    };
    expect(eventBody.parse(value)).toEqual(value);
  });

  it("carries neither a picture nor what is written about it: each is written on its own", () => {
    expect(
      eventBody.parse({
        ...ONCE,
        body: ARTICLE,
        image: "https://cdn.example.com/events/work-day.jpg",
      }),
    ).toEqual(ONCE);
  });

  it("carries no status, note, location or day", () => {
    expect(
      eventBody.parse({
        ...WEEKLY,
        status: "published",
        note: "All welcome",
        location: "Bidwell Park",
        day: "monday",
      }),
    ).toEqual(WEEKLY);
  });

  it("lets only a recurring event pick its weeks", () => {
    expect(eventBody.parse({ ...WEEKLY, weeks: [1, 3] })).toEqual({
      ...WEEKLY,
      weeks: [1, 3],
    });
    expect(issues({ ...ONCE, weeks: [1, 3] })).toEqual(["weeks"]);
    expect(issues({ ...WEEKLY, weeks: [6] })).toEqual(["weeks.0"]);
  });

  it("insists an end comes after its start", () => {
    expect(issues({ ...WEEKLY, end: "10:00" })).toEqual(["end"]);
    expect(issues({ ...WEEKLY, end: "09:30" })).toEqual(["end"]);
    expect(eventBody.safeParse({ ...WEEKLY, end: "11:30" }).success).toBe(true);
  });

  it("needs a slug, a title, a date and a start", () => {
    for (const key of ["slug", "title", "date", "start"]) {
      const { [key]: _gone, ...without } = WEEKLY as Record<string, unknown>;
      expect(issues(without), key).toEqual([key]);
    }
    expect(issues({ ...WEEKLY, title: "" })).toEqual(["title"]);
    expect(issues({ ...WEEKLY, date: "10/17/2026" })).toEqual(["date"]);
    expect(issues({ ...WEEKLY, recurring: "yes" })).toEqual(["recurring"]);
  });
});

describe("eventQuery", () => {
  it("is the listing query, with whether an event recurs and its day to narrow it", () => {
    expect(eventQuery.parse({})).toEqual({ page: 1, size: 25 });
    expect(
      eventQuery.parse({ page: "2", q: "worship", recurringIs: "true" }),
    ).toEqual({ page: 2, size: 25, q: "worship", recurringIs: true });
    expect(
      eventQuery.parse({ recurringNot: "true", dayIs: "sunday" }),
    ).toMatchObject({ recurringNot: true, dayIs: "sunday" });
    expect(
      eventQuery.parse({ recurringIs: "false", dayNot: "monday" }),
    ).toEqual({ page: 1, size: 25, recurringIs: false, dayNot: "monday" });
  });

  it("takes only yes or no, and a day of the week", () => {
    expect(eventQuery.safeParse({ recurringIs: "weekly" }).success).toBe(false);
    expect(eventQuery.safeParse({ recurringNot: "1" }).success).toBe(false);
    expect(eventQuery.safeParse({ dayIs: "funday" }).success).toBe(false);
    expect(eventQuery.safeParse({ dayNot: "Sunday" }).success).toBe(false);
    // A column names its operator: a bare one is no filter.
    expect(eventQuery.parse({ recurring: "true", day: "sunday" })).toEqual({
      page: 1,
      size: 25,
    });
  });

  it("narrows by nothing an event no longer carries", () => {
    expect(
      eventQuery.parse({
        statusIs: "draft",
        noteContains: "welcome",
        locationIs: "present",
      }),
    ).toEqual({ page: 1, size: 25 });
    expect(eventQuery.safeParse({ sort: "status" }).success).toBe(false);
    expect(eventQuery.safeParse({ sort: "location" }).success).toBe(false);
  });

  it("takes what each text column is or is not, carries, starts or ends with", () => {
    const filters = {
      titleIs: "Worship Service",
      slugNot: "work-day",
      summaryNot: "missing",
      imageIs: "present",
      titleContains: "worship",
      slugStartsWith: "work",
      summaryEndsWith: "together.",
      imageNotContains: "cdn",
    };
    expect(eventQuery.parse(filters)).toMatchObject(filters);
    expect(eventQuery.safeParse({ titleIs: "" }).success).toBe(false);
    expect(eventQuery.safeParse({ titleContains: "" }).success).toBe(false);
    // The body is searched by the free text, and filtered by no column.
    expect(eventQuery.parse({ bodyContains: "gloves" })).toEqual({
      page: 1,
      size: 25,
    });
  });

  it("sorts by a column of the record, either way", () => {
    expect(EVENT_SORT_KEYS).toEqual([
      "title",
      "slug",
      "day",
      "date",
      "recurring",
      "start",
      "createdAt",
      "updatedAt",
    ]);
    expect(eventQuery.parse({ sort: "date", direction: "desc" })).toEqual({
      page: 1,
      size: 25,
      sort: "date",
      direction: "desc",
    });
    expect(eventQuery.safeParse({ sort: "body" }).success).toBe(false);
    expect(eventQuery.safeParse({ sort: "id" }).success).toBe(false);
  });

  it("takes a day each event is held, was changed or was added before, after, on, on or after or on or before, as YYYY-MM-DD", () => {
    const filters = {
      dateBefore: "2026-12-31",
      dateAfter: "2026-12-01",
      dateOn: "2026-12-24",
      dateOnOrAfter: "2026-12-02",
      dateOnOrBefore: "2026-12-30",
      updatedAtOn: "2026-10-10",
      updatedAtOnOrAfter: "2026-10-02",
      createdAtBefore: "2026-09-17",
      createdAtOnOrBefore: "2026-09-16",
    };
    expect(eventQuery.parse(filters)).toMatchObject(filters);
    expect(eventQuery.safeParse({ dateOn: "12/24/2026" }).success).toBe(false);
    expect(eventQuery.safeParse({ updatedAtOn: "yesterday" }).success).toBe(
      false,
    );
  });
});

describe("eventForm", () => {
  const form = (value: unknown) =>
    eventForm
      .safeParse(value)
      .error?.issues.map((issue) => issue.path.join(".")) ?? [];

  it("is the body as a form holds it, each week as a select writes it", () => {
    expect(EVENT_WEEKS).toEqual(["1", "2", "3", "4", "5"]);
    const value = { ...WEEKLY, weeks: ["1", "3"], end: "11:30" };
    expect(eventForm.parse(value)).toEqual(value);
    expect(eventForm.parse(ONCE)).toEqual(ONCE);
  });

  it("takes only a week of the month, as a string", () => {
    expect(form({ ...WEEKLY, weeks: ["6"] })).toEqual(["weeks.0"]);
    expect(form({ ...WEEKLY, weeks: [1] })).toEqual(["weeks.0"]);
  });

  it("trims the title, and needs one left", () => {
    expect(eventForm.parse({ ...WEEKLY, title: " Worship " }).title).toBe(
      "Worship",
    );
    expect(form({ ...WEEKLY, title: "   " })).toEqual(["title"]);
  });

  it("keeps the rules of the body, each reported at its field", () => {
    expect(form({ ...ONCE, weeks: ["1"] })).toEqual(["weeks"]);
    expect(form({ ...WEEKLY, end: "09:30" })).toEqual(["end"]);
  });

  it("checks a field on its own, as a form does as it is left", () => {
    expect(eventForm.shape.slug.safeParse("Worship Service").success).toBe(
      false,
    );
    expect(eventForm.shape.date.safeParse(undefined).success).toBe(false);
    expect(eventForm.shape.date.safeParse("10/17/2026").success).toBe(false);
    expect(eventForm.shape.start.safeParse(undefined).success).toBe(false);
    expect(eventForm.shape.start.safeParse("10:00").success).toBe(true);
    expect(eventForm.shape.end.safeParse(undefined).success).toBe(true);
    expect(eventForm.shape.recurring.safeParse(true).success).toBe(true);
  });
});

describe("eventArticle", () => {
  it("takes what is written about an event as a tree, never as a string", () => {
    expect(eventArticle.parse({ body: ARTICLE })).toEqual({ body: ARTICLE });
    expect(
      eventArticle.safeParse({ body: "## Work\n\nBring gloves." }).success,
    ).toBe(false);
  });

  it("takes nothing at all, for an event left without", () => {
    expect(eventArticle.parse({})).toEqual({});
  });
});

describe("eventImage", () => {
  const image = (type: string, size = 8) =>
    new File([new Uint8Array(size)], "event", { type });

  it("takes a JPEG, a PNG or a WebP image", () => {
    expect(EVENT_IMAGE_TYPES).toEqual([
      "image/jpeg",
      "image/png",
      "image/webp",
    ]);
    for (const type of EVENT_IMAGE_TYPES) {
      expect(eventImage.safeParse(image(type)).success, type).toBe(true);
    }
  });

  it("refuses another kind of file, and what is not a file", () => {
    expect(eventImage.safeParse(image("image/svg+xml")).success).toBe(false);
    expect(eventImage.safeParse(image("")).success).toBe(false);
    expect(eventImage.safeParse("event.jpg").success).toBe(false);
  });

  it("refuses an image past 4 MB", () => {
    expect(EVENT_IMAGE_SIZE).toBe(4_194_304);
    expect(
      eventImage.safeParse(image("image/png", EVENT_IMAGE_SIZE)).success,
    ).toBe(true);
    expect(
      eventImage.safeParse(image("image/png", EVENT_IMAGE_SIZE + 1)).success,
    ).toBe(false);
  });
});
