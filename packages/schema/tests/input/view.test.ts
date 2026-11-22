import { describe, expect, it } from "vitest";

import {
  CONTENT_VIEW_COLUMNS,
  EVENT_CALENDAR_VIEWS,
  EVENT_VIEW_COLUMNS,
  PEOPLE_VIEW_COLUMNS,
  VIEW_BODIES,
  VIEW_CLAUSES_SIZE,
  VIEW_NAME_LENGTH,
  VIEW_PAYLOADS,
  browserView,
  calendarView,
  contentView,
  contentViewBody,
  eventView,
  eventViewBody,
  peopleView,
  peopleViewBody,
  tableView,
  viewList,
  viewPath,
} from "../../src/input/view";
import { VIEW_SURFACES } from "../../src/models/view";

const ID = "0b1f4c4e-6f0a-4d0e-9a57-3f0c1c2d4e5f";

/** A table as it starts: nothing sorted, moved, pinned, hidden, sized or searched. */
const BLANK = {
  sorting: [],
  columnOrder: [],
  columnPinning: { start: [], end: [] },
  columnVisibility: {},
  columnSizing: {},
  pageSize: 25,
  clauses: [],
};

const ELDERS = {
  sorting: [{ id: "name", desc: true }],
  columnOrder: ["role", "name"],
  columnPinning: { start: ["name"], end: [] },
  columnVisibility: { email: false },
  columnSizing: { name: 320 },
  pageSize: 50,
  clauses: [
    { kind: "literal", key: "text", value: "smith" },
    { kind: "filter", key: "role", op: "is", value: "elder" },
    {
      kind: "filter",
      key: "updatedAt",
      op: "on or after",
      value: "2026-01-01",
    },
  ],
};

describe("tableView", () => {
  const view = tableView({ sorts: ["title"], columns: ["title", "slug"] });

  it("fills in whatever a view leaves out, so one saved before a member existed reads", () => {
    expect(view.parse({})).toEqual(BLANK);
  });

  it("sorts by the columns named to sort by, and filters by the ones named to filter by", () => {
    expect(
      view.safeParse({ sorting: [{ id: "title", desc: false }] }).success,
    ).toBe(true);
    expect(
      view.safeParse({ sorting: [{ id: "slug", desc: false }] }).success,
    ).toBe(false);
    expect(
      view.safeParse({
        clauses: [{ kind: "filter", key: "slug", value: "welcome" }],
      }).success,
    ).toBe(true);
    expect(
      view.safeParse({
        clauses: [{ kind: "filter", key: "body", value: "welcome" }],
      }).success,
    ).toBe(false);
  });
});

describe("peopleView", () => {
  it("accepts the people table's arrangement, and hands it back as it came", () => {
    expect(peopleView.parse(ELDERS)).toEqual(ELDERS);
    expect(peopleView.parse({})).toEqual(BLANK);
  });

  it("drops what is no part of an arrangement", () => {
    expect(peopleView.parse({ ...ELDERS, pageIndex: 3 })).toEqual(ELDERS);
  });

  it("sorts by a column the API sorts the people by, and no other", () => {
    const sorted = (id: string) =>
      peopleView.safeParse({ sorting: [{ id, desc: false }] }).success;
    expect(sorted("updatedAt")).toBe(true);
    expect(sorted("summary")).toBe(false);
    expect(sorted("bio")).toBe(false);
  });

  it("filters by a column of the people, under an operator the schema names", () => {
    const filtered = (filter: Record<string, string>) =>
      peopleView.safeParse({ clauses: [{ kind: "filter", ...filter }] })
        .success;
    for (const key of PEOPLE_VIEW_COLUMNS) {
      expect(filtered({ key, value: "x" }), key).toBe(true);
    }
    expect(filtered({ key: "bio", value: "x" })).toBe(false);
    expect(filtered({ key: "name", op: "starts with", value: "x" })).toBe(true);
    expect(filtered({ key: "name", op: "sounds like", value: "x" })).toBe(
      false,
    );
    expect(filtered({ key: "name" })).toBe(false);
  });

  it("keeps a page within what the API lists", () => {
    expect(peopleView.safeParse({ pageSize: 100 }).success).toBe(true);
    expect(peopleView.safeParse({ pageSize: 101 }).success).toBe(false);
    expect(peopleView.safeParse({ pageSize: 0 }).success).toBe(false);
    expect(peopleView.safeParse({ pageSize: 2.5 }).success).toBe(false);
  });

  it("holds each member to its shape, and the search to a size", () => {
    expect(peopleView.safeParse({ sorting: "name" }).success).toBe(false);
    expect(
      peopleView.safeParse({ columnVisibility: { name: "no" } }).success,
    ).toBe(false);
    expect(
      peopleView.safeParse({ columnSizing: { name: "wide" } }).success,
    ).toBe(false);
    expect(
      peopleView.safeParse({ clauses: [{ kind: "sort", key: "name" }] })
        .success,
    ).toBe(false);
    const clause = { kind: "literal", key: "text", value: "x" };
    expect(
      peopleView.safeParse({
        clauses: Array.from({ length: VIEW_CLAUSES_SIZE + 1 }, () => clause),
      }).success,
    ).toBe(false);
  });
});

/** A browser as it starts: nothing sorted or searched. */
const UNSORTED = { sortField: null, sortDirection: "asc", clauses: [] };

const IMAGES = {
  sortField: "size",
  sortDirection: "desc",
  clauses: [
    { kind: "literal", key: "text", value: "easter" },
    { kind: "filter", key: "mime", op: "starts with", value: "image/" },
  ],
};

describe("browserView", () => {
  const view = browserView({ sorts: ["title"], columns: ["title", "slug"] });

  it("fills in whatever a view leaves out, so one saved before a member existed reads", () => {
    expect(view.parse({})).toEqual(UNSORTED);
  });

  it("sorts by a column named to sort by, or by none, and filters by the ones named to filter by", () => {
    expect(view.safeParse({ sortField: "title" }).success).toBe(true);
    expect(view.safeParse({ sortField: null }).success).toBe(true);
    expect(view.safeParse({ sortField: "slug" }).success).toBe(false);
    expect(
      view.safeParse({
        clauses: [{ kind: "filter", key: "slug", value: "welcome" }],
      }).success,
    ).toBe(true);
    expect(
      view.safeParse({
        clauses: [{ kind: "filter", key: "body", value: "welcome" }],
      }).success,
    ).toBe(false);
  });
});

describe("calendarView", () => {
  const view = calendarView({
    views: ["week", "month"],
    columns: ["title", "slug"],
  });

  it("fills in whatever a view leaves out, the first of the calendar's views with it", () => {
    expect(view.parse({})).toEqual({ view: "week", clauses: [] });
  });

  it("shows a view the calendar offers, and filters by the columns named to filter by", () => {
    expect(view.safeParse({ view: "month" }).success).toBe(true);
    expect(view.safeParse({ view: "day" }).success).toBe(false);
    expect(
      view.safeParse({
        clauses: [{ kind: "filter", key: "slug", value: "welcome" }],
      }).success,
    ).toBe(true);
    expect(
      view.safeParse({
        clauses: [{ kind: "filter", key: "body", value: "welcome" }],
      }).success,
    ).toBe(false);
  });
});

describe("eventView", () => {
  const WEEKLY = {
    view: "week",
    clauses: [
      { kind: "literal", key: "text", value: "study" },
      { kind: "filter", key: "recurring", op: "is", value: "true" },
    ],
  };

  it("accepts the events calendar's arrangement, and hands it back as it came", () => {
    expect(eventView.parse(WEEKLY)).toEqual(WEEKLY);
    expect(eventView.parse({})).toEqual({ view: "month", clauses: [] });
  });

  it("drops what is no part of an arrangement, the day the calendar stands on with it", () => {
    expect(eventView.parse({ ...WEEKLY, date: "2026-10-17" })).toEqual(WEEKLY);
  });

  it("shows a month, a week or the agenda, and not a day", () => {
    for (const view of EVENT_CALENDAR_VIEWS) {
      expect(eventView.safeParse({ view }).success, view).toBe(true);
    }
    expect(eventView.safeParse({ view: "day" }).success).toBe(false);
  });

  it("filters by a column the API filters the events by, and not by the date they are held", () => {
    const filtered = (filter: Record<string, string>) =>
      eventView.safeParse({ clauses: [{ kind: "filter", ...filter }] }).success;
    for (const key of EVENT_VIEW_COLUMNS) {
      expect(filtered({ key, value: "x" }), key).toBe(true);
    }
    expect(filtered({ key: "date", value: "2026-10-17" })).toBe(false);
    expect(filtered({ key: "day", op: "sounds like", value: "x" })).toBe(false);
  });

  it("is saved under a name", () => {
    expect(eventViewBody.parse({ name: " Weekly ", payload: WEEKLY })).toEqual({
      name: "Weekly",
      payload: WEEKLY,
    });
    expect(eventViewBody.safeParse({ name: "", payload: {} }).success).toBe(
      false,
    );
  });
});

describe("contentView", () => {
  it("accepts the content browser's arrangement, and hands it back as it came", () => {
    expect(contentView.parse(IMAGES)).toEqual(IMAGES);
    expect(contentView.parse({})).toEqual(UNSORTED);
  });

  it("drops what is no part of an arrangement, the folder that is open with it", () => {
    expect(contentView.parse({ ...IMAGES, path: ["2"] })).toEqual(IMAGES);
  });

  it("sorts by a column the API sorts the content by, one way or the other, and no other", () => {
    const sorted = (sortField: string) =>
      contentView.safeParse({ sortField }).success;
    expect(sorted("size")).toBe(true);
    expect(sorted("createdAt")).toBe(true);
    expect(sorted("description")).toBe(false);
    expect(contentView.safeParse({ sortDirection: "desc" }).success).toBe(true);
    expect(contentView.safeParse({ sortDirection: "down" }).success).toBe(
      false,
    );
  });

  it("filters by a column the API filters the content by, under an operator the schema names", () => {
    const filtered = (filter: Record<string, string>) =>
      contentView.safeParse({ clauses: [{ kind: "filter", ...filter }] })
        .success;
    for (const key of CONTENT_VIEW_COLUMNS) {
      expect(filtered({ key, value: "x" }), key).toBe(true);
    }
    expect(filtered({ key: "size", value: "x" })).toBe(false);
    expect(filtered({ key: "mime", op: "starts with", value: "x" })).toBe(true);
    expect(filtered({ key: "mime", op: "sounds like", value: "x" })).toBe(
      false,
    );
  });

  it("holds the search to a size", () => {
    const clause = { kind: "literal", key: "text", value: "x" };
    expect(
      contentView.safeParse({
        clauses: Array.from({ length: VIEW_CLAUSES_SIZE + 1 }, () => clause),
      }).success,
    ).toBe(false);
  });
});

describe("VIEW_PAYLOADS and VIEW_BODIES", () => {
  it("have a schema for every list that has views", () => {
    expect(Object.keys(VIEW_PAYLOADS)).toEqual([...VIEW_SURFACES]);
    expect(Object.keys(VIEW_BODIES)).toEqual([...VIEW_SURFACES]);
    expect(VIEW_PAYLOADS.people).toBe(peopleView);
    expect(VIEW_BODIES.people).toBe(peopleViewBody);
    expect(VIEW_PAYLOADS.content).toBe(contentView);
    expect(VIEW_BODIES.content).toBe(contentViewBody);
  });
});

describe("viewList and viewPath", () => {
  it("name a list that has views, and a view of it by its UUID", () => {
    expect(viewList.parse({ surface: "people" })).toEqual({
      surface: "people",
    });
    expect(viewList.parse({ surface: "content" })).toEqual({
      surface: "content",
    });
    expect(viewList.safeParse({ surface: "sermons" }).success).toBe(false);
    expect(viewPath.parse({ surface: "people", id: ID })).toEqual({
      surface: "people",
      id: ID,
    });
    expect(viewPath.safeParse({ surface: "people", id: "3" }).success).toBe(
      false,
    );
    expect(viewPath.safeParse({ surface: "sermons", id: ID }).success).toBe(
      false,
    );
  });
});

describe("peopleViewBody", () => {
  it("is a view's name, trimmed, and its payload through the people's schema", () => {
    expect(peopleViewBody.parse({ name: " Elders ", payload: {} })).toEqual({
      name: "Elders",
      payload: BLANK,
    });
    expect(peopleViewBody.parse({ name: "Elders", payload: ELDERS })).toEqual({
      name: "Elders",
      payload: ELDERS,
    });
  });

  it("needs a name of a length, and a payload the people's schema accepts", () => {
    expect(peopleViewBody.safeParse({ name: "  ", payload: {} }).success).toBe(
      false,
    );
    expect(
      peopleViewBody.safeParse({
        name: "x".repeat(VIEW_NAME_LENGTH + 1),
        payload: {},
      }).success,
    ).toBe(false);
    expect(peopleViewBody.safeParse({ name: "Elders" }).success).toBe(false);
    expect(
      peopleViewBody.safeParse({
        name: "Elders",
        payload: { sorting: [{ id: "bio", desc: false }] },
      }).success,
    ).toBe(false);
  });
});

describe("contentViewBody", () => {
  it("is a view's name, trimmed, and its payload through the content's schema", () => {
    expect(contentViewBody.parse({ name: " Images ", payload: {} })).toEqual({
      name: "Images",
      payload: UNSORTED,
    });
    expect(contentViewBody.parse({ name: "Images", payload: IMAGES })).toEqual({
      name: "Images",
      payload: IMAGES,
    });
  });

  it("needs a name, and a payload the content's schema accepts", () => {
    expect(contentViewBody.safeParse({ name: "  ", payload: {} }).success).toBe(
      false,
    );
    expect(contentViewBody.safeParse({ name: "Images" }).success).toBe(false);
    expect(
      contentViewBody.safeParse({
        name: "Images",
        payload: { sortField: "description" },
      }).success,
    ).toBe(false);
  });
});
