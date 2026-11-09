import { afterEach, describe, expect, it, vi } from "vitest";

import { service } from "@bbf/nuxt/testing/bezoar";
import { useEvents } from "~~/server/composables/events";

const BODY = {
  type: "root" as const,
  children: [
    {
      type: "element" as const,
      tagName: "p",
      properties: {},
      children: [{ type: "text" as const, value: "We gather." }],
    },
  ],
};

const ROW = {
  id: 3,
  slug: "worship-service",
  title: "Worship Service",
  summary: null,
  body: null as unknown,
  image: null as string | null,
  date: "2026-01-04",
  recurring: true,
  weeks: [1, 3] as number[] | null,
  start_time: "10:00:00",
  end_time: "11:30:00",
  created_at: new Date("2026-10-17T18:00:00Z"),
  updated_at: new Date("2026-10-18T09:30:00Z"),
};

const RECORD = {
  id: 3,
  slug: "worship-service",
  title: "Worship Service",
  date: "2026-01-04",
  day: "sunday",
  recurring: true,
  weeks: [1, 3],
  start: "10:00",
  end: "11:30",
  createdAt: "2026-10-17T18:00:00.000Z",
  updatedAt: "2026-10-18T09:30:00.000Z",
};

const ROWS = [
  ROW,
  {
    ...ROW,
    id: 4,
    slug: "work-day",
    title: "Work Day",
    date: "2026-10-17",
    recurring: false,
    weeks: null,
  },
];

const ONCE = {
  id: 4,
  slug: "work-day",
  title: "Work Day",
  date: "2026-10-17",
  day: "saturday",
  recurring: false,
  start: "10:00",
  end: "11:30",
  createdAt: RECORD.createdAt,
  updatedAt: RECORD.updatedAt,
};

const TEXT_COLUMNS = ["title", "slug", "summary", "image"] as const;
const TEXT_OPERATORS = [
  "is",
  "not",
  "contains",
  "not_contains",
  "starts_with",
  "ends_with",
] as const;
const DAY_COLUMNS = ["date", "updated", "created"] as const;
const DAY_OPERATORS = [
  "before",
  "after",
  "on",
  "on_or_after",
  "on_or_before",
] as const;

type Search = {
  q: string | null;
  recurring_is: boolean | null;
  recurring_not: boolean | null;
  day_is: string | null;
  day_not: string | null;
  tz: string;
} & Record<
  `${(typeof TEXT_COLUMNS)[number]}_${(typeof TEXT_OPERATORS)[number]}`,
  string | null
> &
  Record<
    `${(typeof DAY_COLUMNS)[number]}_${(typeof DAY_OPERATORS)[number]}`,
    string | null
  >;

/* Every part of the search left out: null, but for the time zone. */
const NONE: Search = {
  q: null,
  recurring_is: null,
  recurring_not: null,
  day_is: null,
  day_not: null,
  tz: "America/Los_Angeles",
  ...(Object.fromEntries([
    ...TEXT_COLUMNS.flatMap((column) =>
      TEXT_OPERATORS.map((operator) => [`${column}_${operator}`, null]),
    ),
    ...DAY_COLUMNS.flatMap((column) =>
      DAY_OPERATORS.map((operator) => [`${column}_${operator}`, null]),
    ),
  ]) as Omit<
    Search,
    "q" | "recurring_is" | "recurring_not" | "day_is" | "day_not" | "tz"
  >),
};

type Order = { sort: string | null; direction: string };

const ORDER: Order = { sort: null, direction: "asc" };

const matches = (search: Search) => (row: (typeof ROWS)[number]) =>
  (search.q === null ||
    row.title.toLowerCase().includes(search.q.toLowerCase())) &&
  (search.recurring_is === null || row.recurring === search.recurring_is) &&
  (search.recurring_not === null || row.recurring !== search.recurring_not) &&
  (search.title_is === null || row.title === search.title_is);

/* A page of the search, each row carrying how many the search holds. */
const list = vi.fn(
  async ({
    size,
    offset,
    sort: _sort,
    direction: _direction,
    ...search
  }: Search & Order & { size: number; offset: number }) => {
    const found = ROWS.filter(matches(search));
    return found
      .slice(offset, offset + size)
      .map((row) => ({ ...row, total: found.length }));
  },
);

/* One event, whose picture and body the queries read and write. */
const held = { body: null as unknown, image: null as string | null };
const fetched = vi.fn(async ({ id }: { id: number }) =>
  id === 3
    ? { ...ROW, ...held }
    : id === 5
      ? { ...ROW, id: 5, slug: "new" }
      : null,
);
const created = vi.fn(async (args: { slug: string }) => ({
  id: 5,
  slug: args.slug,
  created_at: ROW.created_at,
}));
const updated = vi.fn(async (args: { id: number; slug: string }) =>
  args.id === 3 ? { id: 3, slug: args.slug, updated_at: ROW.updated_at } : null,
);
const pictured = vi.fn(
  async ({ id, image }: { id: number; image: string | null }) => {
    if (id !== 3) return null;
    held.image = image;
    return { id, updated_at: ROW.updated_at };
  },
);
const written = vi.fn(async ({ id, body }: { id: number; body: unknown }) => {
  if (id !== 3) return null;
  held.body = body;
  return { id, updated_at: ROW.updated_at };
});
const deleted = vi.fn(async ({ id }: { id: number }) => (id === 3 ? 1 : 0));

Object.assign(service, {
  admin: {
    events: {
      list,
      fetch: { first: fetched },
      create: { first: created },
      update: { first: updated },
      image: { first: pictured },
      body: { first: written },
      delete: deleted,
    },
  },
});

afterEach(() => {
  held.body = null;
  held.image = null;
  for (const query of [
    list,
    fetched,
    created,
    updated,
    pictured,
    written,
    deleted,
  ]) {
    query.mockClear();
  }
});

describe("useEvents", () => {
  it("asks the database for one page of the events, which carries how many there are in all", async () => {
    expect(await useEvents().list({ page: 1, size: 1 })).toEqual({
      items: [RECORD],
      total: 2,
    });
    expect(list).toHaveBeenCalledTimes(1);
    expect(list).toHaveBeenCalledWith({
      ...NONE,
      ...ORDER,
      size: 1,
      offset: 0,
    });
    expect(await useEvents().list({ page: 2, size: 1 })).toEqual({
      items: [ONCE],
      total: 2,
    });
    expect(list).toHaveBeenLastCalledWith({
      ...NONE,
      ...ORDER,
      size: 1,
      offset: 1,
    });
  });

  it("asks the first row for the total when the page is past the end", async () => {
    expect(await useEvents().list({ page: 3, size: 1, q: "o" })).toEqual({
      items: [],
      total: 2,
    });
    expect(list).toHaveBeenCalledTimes(2);
    expect(list).toHaveBeenLastCalledWith({
      ...NONE,
      ...ORDER,
      q: "o",
      size: 1,
      offset: 0,
    });
  });

  it("counts nothing when the search finds nothing", async () => {
    expect(
      await useEvents().list({ page: 1, size: 25, titleIs: "Nothing" }),
    ).toEqual({ items: [], total: 0 });
    expect(list).toHaveBeenCalledTimes(1);
  });

  it("asks for the sort the query names, by the row's column, ascending unless told", async () => {
    await useEvents().list({ page: 1, size: 25, sort: "start" });
    expect(list).toHaveBeenLastCalledWith({
      ...NONE,
      sort: "start_time",
      direction: "asc",
      size: 25,
      offset: 0,
    });
    await useEvents().list({
      page: 1,
      size: 25,
      sort: "updatedAt",
      direction: "desc",
    });
    expect(list).toHaveBeenLastCalledWith({
      ...NONE,
      sort: "updated_at",
      direction: "desc",
      size: 25,
      offset: 0,
    });
    for (const sort of ["title", "slug", "day", "date", "recurring"] as const) {
      await useEvents().list({ page: 1, size: 25, sort });
      expect(list).toHaveBeenLastCalledWith(expect.objectContaining({ sort }));
    }
    await useEvents().list({ page: 1, size: 25, sort: "createdAt" });
    expect(list).toHaveBeenLastCalledWith(
      expect.objectContaining({ sort: "created_at" }),
    );
  });

  it("hands the database the search, and null for each part left out or empty", async () => {
    expect(await useEvents().list({ page: 1, size: 25, q: "WORK" })).toEqual({
      items: [ONCE],
      total: 1,
    });
    expect(
      await useEvents().list({ page: 1, size: 25, recurringIs: false }),
    ).toEqual({ items: [ONCE], total: 1 });
    await useEvents().list({
      page: 1,
      size: 25,
      q: "",
      recurringIs: true,
      dayNot: "monday",
    });
    expect(list).toHaveBeenLastCalledWith({
      ...NONE,
      ...ORDER,
      recurring_is: true,
      day_not: "monday",
      size: 25,
      offset: 0,
    });
    await useEvents().list({
      page: 1,
      size: 25,
      recurringNot: false,
      dayIs: "sunday",
    });
    expect(list).toHaveBeenLastCalledWith({
      ...NONE,
      ...ORDER,
      recurring_not: false,
      day_is: "sunday",
      size: 25,
      offset: 0,
    });
  });

  it("hands the database each text filter under the SQL's name for it", async () => {
    await useEvents().list({
      page: 1,
      size: 25,
      titleContains: "worship",
      slugStartsWith: "work",
      summaryNotContains: "gather",
      imageIs: "missing",
      imageEndsWith: ".jpg",
    });
    expect(list).toHaveBeenLastCalledWith({
      ...NONE,
      ...ORDER,
      title_contains: "worship",
      slug_starts_with: "work",
      summary_not_contains: "gather",
      image_is: "missing",
      image_ends_with: ".jpg",
      size: 25,
      offset: 0,
    });
  });

  it("hands the database each day asked for: the date held, and the days changed and added in the church's time zone", async () => {
    await useEvents().list({
      page: 1,
      size: 25,
      dateOn: "2026-12-24",
      dateOnOrAfter: "2026-12-01",
      dateBefore: "2026-12-31",
      updatedAtAfter: "2026-10-01",
      updatedAtOnOrBefore: "2026-10-16",
      createdAtOn: "2026-09-10",
    });
    expect(list).toHaveBeenLastCalledWith({
      ...NONE,
      ...ORDER,
      date_on: "2026-12-24",
      date_on_or_after: "2026-12-01",
      date_before: "2026-12-31",
      updated_after: "2026-10-01",
      updated_on_or_before: "2026-10-16",
      created_on: "2026-09-10",
      size: 25,
      offset: 0,
    });
  });

  it("fetches one event by id, or nothing", async () => {
    expect(await useEvents().fetch(3)).toEqual(RECORD);
    expect(await useEvents().fetch(9)).toBeNull();
  });

  it("creates an event from its details, and hands back the record", async () => {
    const record = await useEvents().create({
      slug: "new",
      title: "New",
      date: "2026-12-24",
      recurring: false,
      start: "18:00",
    });
    expect(created).toHaveBeenCalledWith({
      slug: "new",
      title: "New",
      summary: null,
      date: "2026-12-24",
      recurring: false,
      weeks: null,
      start: "18:00",
      end: null,
    });
    expect(record).toMatchObject({ id: 5, slug: "new" });
  });

  it("hands back nothing when nothing was written", async () => {
    created.mockResolvedValueOnce(null as never);
    expect(
      await useEvents().create({
        slug: "new",
        title: "New",
        date: "2026-01-05",
        recurring: true,
        start: "18:00",
      }),
    ).toBeNull();
  });

  it("replaces an event's details, or nothing when no event has the id", async () => {
    const body = {
      slug: "worship-service",
      title: "Worship",
      date: "2026-01-04",
      recurring: true,
      weeks: [1, 3],
      start: "10:00",
    };
    expect(await useEvents().update(3, body)).toEqual(RECORD);
    expect(updated).toHaveBeenCalledWith(
      expect.objectContaining({ id: 3, title: "Worship", weeks: [1, 3] }),
    );
    expect(updated.mock.calls[0]?.[0]).not.toHaveProperty("body");
    expect(updated.mock.calls[0]?.[0]).not.toHaveProperty("image");
    expect(await useEvents().update(9, body)).toBeNull();
  });

  it("sets an event's picture on its own, or clears it, and hands back the record", async () => {
    const image = "https://cdn.example.com/events/worship.jpg";
    expect(await useEvents().setImage(3, image)).toEqual({ ...RECORD, image });
    expect(pictured).toHaveBeenCalledWith({ id: 3, image });
    expect(await useEvents().setImage(3, null)).toEqual(RECORD);
    expect(pictured).toHaveBeenLastCalledWith({ id: 3, image: null });
  });

  it("sets what is written about an event on its own, or clears it when the body has none", async () => {
    expect(await useEvents().setBody(3, { body: BODY })).toEqual({
      ...RECORD,
      body: BODY,
    });
    expect(written).toHaveBeenCalledWith({ id: 3, body: BODY });
    expect(await useEvents().setBody(3, {})).toEqual(RECORD);
    expect(written).toHaveBeenLastCalledWith({ id: 3, body: null });
  });

  it("sets neither when no event has the id", async () => {
    expect(await useEvents().setImage(9, null)).toBeNull();
    expect(await useEvents().setBody(9, { body: BODY })).toBeNull();
  });

  it("removes an event, and says whether there was one", async () => {
    expect(await useEvents().remove(3)).toBe(true);
    expect(await useEvents().remove(9)).toBe(false);
  });
});
