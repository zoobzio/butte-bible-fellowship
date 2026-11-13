import { afterEach, describe, expect, it, vi } from "vitest";

import { service } from "@bbf/nuxt/testing/bezoar";
import { useContent } from "~~/server/composables/content";

const BODY = {
  type: "root" as const,
  children: [
    {
      type: "element" as const,
      tagName: "p",
      properties: {},
      children: [{ type: "text" as const, value: "Our vision." }],
    },
  ],
};

const ROW = {
  id: 3,
  slug: "about-us",
  title: "About Us",
  description: null as string | null,
  body: null as unknown,
  created_at: new Date("2026-10-17T18:00:00Z"),
  updated_at: new Date("2026-10-18T09:30:00Z"),
};

const RECORD = {
  id: 3,
  slug: "about-us",
  title: "About Us",
  createdAt: "2026-10-17T18:00:00.000Z",
  updatedAt: "2026-10-18T09:30:00.000Z",
};

const ROWS = [
  ROW,
  {
    ...ROW,
    id: 4,
    slug: "index",
    title: "Home",
    description: "A local church.",
  },
];

const HOME = {
  ...RECORD,
  id: 4,
  slug: "index",
  title: "Home",
  description: "A local church.",
};

const TEXT_COLUMNS = ["title", "slug", "description"] as const;
const TEXT_OPERATORS = [
  "is",
  "not",
  "contains",
  "not_contains",
  "starts_with",
  "ends_with",
] as const;
const DAY_COLUMNS = ["updated", "created"] as const;
const DAY_OPERATORS = [
  "before",
  "after",
  "on",
  "on_or_after",
  "on_or_before",
] as const;

type Search = {
  q: string | null;
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
  tz: "America/Los_Angeles",
  ...(Object.fromEntries([
    ...TEXT_COLUMNS.flatMap((column) =>
      TEXT_OPERATORS.map((operator) => [`${column}_${operator}`, null]),
    ),
    ...DAY_COLUMNS.flatMap((column) =>
      DAY_OPERATORS.map((operator) => [`${column}_${operator}`, null]),
    ),
  ]) as Omit<Search, "q" | "tz">),
};

type Order = { sort: string | null; direction: string };

const ORDER: Order = { sort: null, direction: "asc" };

const matches = (search: Search) => (row: (typeof ROWS)[number]) =>
  (search.q === null ||
    row.title.toLowerCase().includes(search.q.toLowerCase())) &&
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

/* One page, whose body the queries read and write. */
const held = { body: null as unknown };
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
const written = vi.fn(async ({ id, body }: { id: number; body: unknown }) => {
  if (id !== 3) return null;
  held.body = body;
  return { id, updated_at: ROW.updated_at };
});
const deleted = vi.fn(async ({ id }: { id: number }) => (id === 3 ? 1 : 0));

Object.assign(service, {
  admin: {
    content: {
      list,
      fetch: { first: fetched },
      create: { first: created },
      update: { first: updated },
      body: { first: written },
      delete: deleted,
    },
  },
});

afterEach(() => {
  held.body = null;
  for (const query of [list, fetched, created, updated, written, deleted]) {
    query.mockClear();
  }
});

describe("useContent", () => {
  it("asks the database for one page of the pages, which carries how many there are in all", async () => {
    expect(await useContent().list({ page: 1, size: 1 })).toEqual({
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
    expect(await useContent().list({ page: 2, size: 1 })).toEqual({
      items: [HOME],
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
    expect(await useContent().list({ page: 3, size: 1, q: "o" })).toEqual({
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
      await useContent().list({ page: 1, size: 25, titleIs: "Nothing" }),
    ).toEqual({ items: [], total: 0 });
    expect(list).toHaveBeenCalledTimes(1);
  });

  it("asks for the sort the query names, by the row's column, ascending unless told", async () => {
    await useContent().list({ page: 1, size: 25, sort: "title" });
    expect(list).toHaveBeenLastCalledWith({
      ...NONE,
      sort: "title",
      direction: "asc",
      size: 25,
      offset: 0,
    });
    await useContent().list({
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
    await useContent().list({ page: 1, size: 25, sort: "slug" });
    expect(list).toHaveBeenLastCalledWith(
      expect.objectContaining({ sort: "slug" }),
    );
    await useContent().list({ page: 1, size: 25, sort: "createdAt" });
    expect(list).toHaveBeenLastCalledWith(
      expect.objectContaining({ sort: "created_at" }),
    );
  });

  it("hands the database the search, and null for each part left out or empty", async () => {
    expect(await useContent().list({ page: 1, size: 25, q: "HOME" })).toEqual({
      items: [HOME],
      total: 1,
    });
    expect(list).toHaveBeenLastCalledWith({
      ...NONE,
      ...ORDER,
      q: "HOME",
      size: 25,
      offset: 0,
    });
    await useContent().list({ page: 1, size: 25, q: "" });
    expect(list).toHaveBeenLastCalledWith({
      ...NONE,
      ...ORDER,
      size: 25,
      offset: 0,
    });
  });

  it("hands the database each text filter under the SQL's name for it", async () => {
    await useContent().list({
      page: 1,
      size: 25,
      titleContains: "about",
      titleNotContains: "events",
      slugStartsWith: "about",
      slugEndsWith: "us",
      descriptionIs: "missing",
      descriptionNot: "present",
    });
    expect(list).toHaveBeenLastCalledWith({
      ...NONE,
      ...ORDER,
      title_contains: "about",
      title_not_contains: "events",
      slug_starts_with: "about",
      slug_ends_with: "us",
      description_is: "missing",
      description_not: "present",
      size: 25,
      offset: 0,
    });
  });

  it("hands the database each day asked for: the days changed and added, in the church's time zone", async () => {
    await useContent().list({
      page: 1,
      size: 25,
      updatedAtOnOrAfter: "2026-10-01",
      updatedAtOnOrBefore: "2026-10-31",
      createdAtBefore: "2026-11-01",
      createdAtOn: "2026-10-17",
    });
    expect(list).toHaveBeenLastCalledWith({
      ...NONE,
      ...ORDER,
      updated_on_or_after: "2026-10-01",
      updated_on_or_before: "2026-10-31",
      created_before: "2026-11-01",
      created_on: "2026-10-17",
      size: 25,
      offset: 0,
    });
  });

  it("fetches one page by id, or nothing", async () => {
    expect(await useContent().fetch(3)).toEqual(RECORD);
    expect(await useContent().fetch(9)).toBeNull();
  });

  it("creates a page from its metadata, and hands back the record", async () => {
    const record = await useContent().create({
      slug: "new",
      title: "New",
      description: "A new page.",
    });
    expect(created).toHaveBeenCalledWith({
      slug: "new",
      title: "New",
      description: "A new page.",
    });
    expect(fetched).toHaveBeenCalledWith({ id: 5 });
    expect(record).toMatchObject({ id: 5, slug: "new" });
  });

  it("hands back nothing when nothing was written", async () => {
    created.mockResolvedValueOnce(null as never);
    expect(await useContent().create({ slug: "new", title: "New" })).toBeNull();
    expect(fetched).not.toHaveBeenCalled();
  });

  it("replaces a page's metadata, or nothing when no page has the id", async () => {
    const body = { slug: "about-us", title: "About", description: "Who." };
    expect(await useContent().update(3, body)).toEqual(RECORD);
    expect(updated).toHaveBeenCalledWith({
      slug: "about-us",
      title: "About",
      description: "Who.",
      id: 3,
    });
    expect(await useContent().update(9, body)).toBeNull();
    expect(fetched).toHaveBeenCalledTimes(1);
  });

  it("sets what is written on a page on its own, or clears it when the body has none", async () => {
    expect(await useContent().setBody(3, { body: BODY })).toEqual({
      ...RECORD,
      body: BODY,
    });
    expect(written).toHaveBeenLastCalledWith({ id: 3, body: BODY });
    expect(await useContent().setBody(3, {})).toEqual(RECORD);
    expect(written).toHaveBeenLastCalledWith({ id: 3, body: null });
  });

  it("sets nothing when no page has the id", async () => {
    expect(await useContent().setBody(9, { body: BODY })).toBeNull();
  });

  it("removes a page, and says whether there was one", async () => {
    expect(await useContent().remove(3)).toBe(true);
    expect(await useContent().remove(9)).toBe(false);
    expect(deleted).toHaveBeenCalledWith({ id: 3 });
  });
});
