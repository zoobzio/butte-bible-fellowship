import { afterEach, describe, expect, it, vi } from "vitest";

import { service } from "@bbf/nuxt/testing/bezoar";
import { useStaff } from "~~/server/composables/staff";

const BIO = {
  type: "root",
  children: [
    {
      type: "element",
      tagName: "p",
      properties: {},
      children: [{ type: "text", value: "Has served since 2010." }],
    },
  ],
};

const ROW = {
  id: 1,
  name: "Jane Doe",
  role: "elder" as const,
  summary: null,
  bio: BIO,
  photo: null,
  email: "jane@example.com",
  phone: null,
  status: "published" as const,
  created_at: new Date("2026-10-17T18:00:00Z"),
  updated_at: new Date("2026-10-18T09:30:00Z"),
};

const RECORD = {
  id: 1,
  name: "Jane Doe",
  role: "elder",
  bio: BIO,
  email: "jane@example.com",
  status: "published",
  createdAt: "2026-10-17T18:00:00.000Z",
  updatedAt: "2026-10-18T09:30:00.000Z",
};

const ROWS = [ROW, { ...ROW, id: 2, name: "John Roe" }];

type Role = "pastor" | "elder" | "staff";
type Status = "draft" | "published" | "archived";

const TEXT_COLUMNS = ["name", "email", "phone", "summary", "photo"] as const;
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
  role_is: Role | null;
  role_not: Role | null;
  status_is: Status | null;
  status_not: Status | null;
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
  role_is: null,
  role_not: null,
  status_is: null,
  status_not: null,
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
    "q" | "role_is" | "role_not" | "status_is" | "status_not" | "tz"
  >),
};

type Order = { sort: string | null; direction: string };

const ORDER: Order = { sort: null, direction: "asc" };

const matches = (search: Search) => (row: (typeof ROWS)[number]) =>
  (search.q === null ||
    row.name.toLowerCase().includes(search.q.toLowerCase())) &&
  (search.role_is === null || row.role === search.role_is) &&
  (search.role_not === null || row.role !== search.role_not) &&
  (search.status_is === null || row.status === search.status_is) &&
  (search.status_not === null || row.status !== search.status_not) &&
  (search.email_is === null ||
    (row.email !== null) === (search.email_is === "present"));

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
const fetched = vi.fn(async ({ id }: { id: number }) =>
  id === 3
    ? { ...ROW, id: 3, name: "New", status: "draft" as const }
    : (ROWS.find((row) => row.id === id) ?? null),
);
const created = vi.fn(async () => ({ id: 3, created_at: ROW.created_at }));
const updated = vi.fn(async (args: { id: number }) =>
  args.id === 1 ? { id: 1, updated_at: ROW.updated_at } : null,
);
const portrayed = vi.fn(async (args: { id: number; photo: string | null }) =>
  args.id === 1 ? { id: 1, updated_at: ROW.updated_at } : null,
);
const described = vi.fn(async (args: { id: number; bio: unknown }) =>
  args.id === 1 ? { id: 1, updated_at: ROW.updated_at } : null,
);
const deleted = vi.fn(async ({ id }: { id: number }) => (id === 1 ? 1 : 0));

Object.assign(service, {
  admin: {
    staff: {
      list,
      fetch: { first: fetched },
      create: { first: created },
      update: { first: updated },
      photo: { first: portrayed },
      bio: { first: described },
      delete: deleted,
    },
  },
});

afterEach(() => {
  for (const query of [
    list,
    fetched,
    created,
    updated,
    portrayed,
    described,
    deleted,
  ]) {
    query.mockClear();
  }
});

describe("useStaff", () => {
  it("asks the database for one page of the staff, which carries how many there are in all", async () => {
    expect(await useStaff().list({ page: 1, size: 1 })).toEqual({
      items: [RECORD],
      total: 2,
    });
    expect(list).toHaveBeenCalledWith({
      ...NONE,
      ...ORDER,
      size: 1,
      offset: 0,
    });
    expect(list).toHaveBeenCalledTimes(1);
    expect(await useStaff().list({ page: 2, size: 1 })).toEqual({
      items: [{ ...RECORD, id: 2, name: "John Roe" }],
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
    expect(await useStaff().list({ page: 3, size: 1, q: "o" })).toEqual({
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

  it("asks for the sort the query names, by the row's column, ascending unless told", async () => {
    await useStaff().list({ page: 1, size: 25, sort: "updatedAt" });
    expect(list).toHaveBeenLastCalledWith({
      ...NONE,
      sort: "updated_at",
      direction: "asc",
      size: 25,
      offset: 0,
    });
    await useStaff().list({
      page: 1,
      size: 25,
      sort: "email",
      direction: "desc",
    });
    expect(list).toHaveBeenLastCalledWith({
      ...NONE,
      sort: "email",
      direction: "desc",
      size: 25,
      offset: 0,
    });
  });

  it("hands the database the search, and null for each part left out or empty", async () => {
    expect(await useStaff().list({ page: 1, size: 25, q: "ROE" })).toEqual({
      items: [{ ...RECORD, id: 2, name: "John Roe" }],
      total: 1,
    });
    await useStaff().list({ page: 1, size: 25, q: "", roleIs: "pastor" });
    expect(list).toHaveBeenLastCalledWith({
      ...NONE,
      ...ORDER,
      role_is: "pastor",
      size: 25,
      offset: 0,
    });
    await useStaff().list({
      page: 1,
      size: 25,
      roleNot: "pastor",
      statusIs: "draft",
      statusNot: "archived",
    });
    expect(list).toHaveBeenLastCalledWith({
      ...NONE,
      ...ORDER,
      role_not: "pastor",
      status_is: "draft",
      status_not: "archived",
      size: 25,
      offset: 0,
    });
  });

  it("hands the database what each text column is or is not, present or missing among them", async () => {
    expect(
      await useStaff().list({ page: 1, size: 25, emailIs: "missing" }),
    ).toEqual({ items: [], total: 0 });
    await useStaff().list({
      page: 1,
      size: 25,
      nameIs: "Jane Doe",
      nameNot: "John Roe",
      emailIs: "present",
      phoneNot: "missing",
      summaryIs: "present",
      photoNot: "https://cdn.example.com/x.jpg",
    });
    expect(list).toHaveBeenLastCalledWith({
      ...NONE,
      ...ORDER,
      name_is: "Jane Doe",
      name_not: "John Roe",
      email_is: "present",
      phone_not: "missing",
      summary_is: "present",
      photo_not: "https://cdn.example.com/x.jpg",
      size: 25,
      offset: 0,
    });
  });

  it("hands the database the text each text column carries, does not, starts or ends with", async () => {
    await useStaff().list({
      page: 1,
      size: 25,
      nameContains: "jane",
      emailNotContains: "example.com",
      phoneStartsWith: "530",
      summaryEndsWith: "2010.",
      photoContains: "cdn",
    });
    expect(list).toHaveBeenLastCalledWith({
      ...NONE,
      ...ORDER,
      name_contains: "jane",
      email_not_contains: "example.com",
      phone_starts_with: "530",
      summary_ends_with: "2010.",
      photo_contains: "cdn",
      size: 25,
      offset: 0,
    });
  });

  it("hands the database each day asked for, read in the church's time zone", async () => {
    await useStaff().list({
      page: 1,
      size: 25,
      updatedAtBefore: "2026-10-17",
      updatedAtAfter: "2026-10-01",
      updatedAtOn: "2026-10-10",
      updatedAtOnOrAfter: "2026-10-02",
      updatedAtOnOrBefore: "2026-10-16",
      createdAtBefore: "2026-09-17",
      createdAtAfter: "2026-09-01",
      createdAtOn: "2026-09-10",
      createdAtOnOrAfter: "2026-09-02",
      createdAtOnOrBefore: "2026-09-16",
    });
    expect(list).toHaveBeenLastCalledWith({
      ...NONE,
      ...ORDER,
      size: 25,
      offset: 0,
      updated_before: "2026-10-17",
      updated_after: "2026-10-01",
      updated_on: "2026-10-10",
      updated_on_or_after: "2026-10-02",
      updated_on_or_before: "2026-10-16",
      created_before: "2026-09-17",
      created_after: "2026-09-01",
      created_on: "2026-09-10",
      created_on_or_after: "2026-09-02",
      created_on_or_before: "2026-09-16",
    });
  });

  it("counts nothing when the search finds nothing", async () => {
    expect(
      await useStaff().list({ page: 1, size: 25, roleIs: "pastor" }),
    ).toEqual({ items: [], total: 0 });
    expect(list).toHaveBeenCalledTimes(1);
    expect(
      await useStaff().list({ page: 2, size: 25, roleIs: "pastor" }),
    ).toEqual({ items: [], total: 0 });
    expect(list).toHaveBeenCalledTimes(3);
  });

  it("fetches one member by id, or nothing", async () => {
    expect(await useStaff().fetch(1)).toEqual(RECORD);
    expect(fetched).toHaveBeenCalledWith({ id: 1 });
    expect(await useStaff().fetch(9)).toBeNull();
  });

  it("creates a member from their body, and hands back the record", async () => {
    const record = await useStaff().create({
      name: "New",
      role: "staff",
      status: "draft",
    });
    expect(created).toHaveBeenCalledWith({
      name: "New",
      role: "staff",
      summary: null,
      email: null,
      phone: null,
      status: "draft",
    });
    expect(record).toMatchObject({ id: 3, name: "New", status: "draft" });
  });

  it("hands back nothing when nothing was written", async () => {
    created.mockResolvedValueOnce(null as never);
    expect(
      await useStaff().create({ name: "New", role: "staff", status: "draft" }),
    ).toBeNull();
  });

  it("replaces a member's details, and hands back the record", async () => {
    const record = await useStaff().update(1, {
      name: "Jane Doe",
      role: "pastor",
      status: "published",
    });
    expect(updated).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, role: "pastor", summary: null }),
    );
    expect(record).toEqual(RECORD);
    expect(fetched).toHaveBeenCalledWith({ id: 1 });
  });

  it("updates nothing when no member has the id", async () => {
    expect(
      await useStaff().update(9, { name: "x", role: "staff", status: "draft" }),
    ).toBeNull();
    expect(fetched).not.toHaveBeenCalled();
  });

  it("sets a member's photo on its own, or clears it, and hands back the record", async () => {
    const photo = "https://cdn.example.com/staff/jane-doe.jpg";
    expect(await useStaff().setPhoto(1, photo)).toEqual(RECORD);
    expect(portrayed).toHaveBeenCalledWith({ id: 1, photo });
    expect(await useStaff().setPhoto(1, null)).toEqual(RECORD);
    expect(portrayed).toHaveBeenLastCalledWith({ id: 1, photo: null });
    expect(updated).not.toHaveBeenCalled();
    expect(described).not.toHaveBeenCalled();
  });

  it("sets a member's bio on its own, or clears it when the body has none", async () => {
    expect(await useStaff().setBio(1, { bio: BIO as never })).toEqual(RECORD);
    expect(described).toHaveBeenCalledWith({ id: 1, bio: BIO });
    expect(await useStaff().setBio(1, {})).toEqual(RECORD);
    expect(described).toHaveBeenLastCalledWith({ id: 1, bio: null });
    expect(updated).not.toHaveBeenCalled();
    expect(portrayed).not.toHaveBeenCalled();
  });

  it("sets neither when no member has the id", async () => {
    expect(await useStaff().setPhoto(9, null)).toBeNull();
    expect(await useStaff().setBio(9, {})).toBeNull();
    expect(fetched).not.toHaveBeenCalled();
  });

  it("removes a member, and says whether there was one", async () => {
    expect(await useStaff().remove(1)).toBe(true);
    expect(deleted).toHaveBeenCalledWith({ id: 1 });
    expect(await useStaff().remove(9)).toBe(false);
  });
});
