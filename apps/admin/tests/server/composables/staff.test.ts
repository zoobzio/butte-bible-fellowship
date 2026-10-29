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

type Search = {
  q: string | null;
  role: "pastor" | "elder" | "staff" | null;
  status: "draft" | "published" | "archived" | null;
  tz: string;
  updated_before: string | null;
  updated_after: string | null;
  updated_on: string | null;
  created_before: string | null;
  created_after: string | null;
  created_on: string | null;
};

const NONE: Search = {
  q: null,
  role: null,
  status: null,
  tz: "America/Los_Angeles",
  updated_before: null,
  updated_after: null,
  updated_on: null,
  created_before: null,
  created_after: null,
  created_on: null,
};

type Order = { sort: string; direction: string };

const ORDER: Order = { sort: "role", direction: "asc" };

const matches = (search: Search) => (row: (typeof ROWS)[number]) =>
  (search.q === null ||
    row.name.toLowerCase().includes(search.q.toLowerCase())) &&
  (search.role === null || row.role === search.role) &&
  (search.status === null || row.status === search.status);

const list = vi.fn(
  async ({
    size,
    offset,
    sort: _sort,
    direction: _direction,
    ...search
  }: Search & Order & { size: number; offset: number }) =>
    ROWS.filter(matches(search)).slice(offset, offset + size),
);
const counted = vi.fn(async (search: Search) => ({
  total: ROWS.filter(matches(search)).length,
}));
const fetched = vi.fn(async ({ id }: { id: number }) =>
  id === 3
    ? { ...ROW, id: 3, name: "New", status: "draft" as const }
    : (ROWS.find((row) => row.id === id) ?? null),
);
const created = vi.fn(async () => ({ id: 3, created_at: ROW.created_at }));
const updated = vi.fn(async (args: { id: number }) =>
  args.id === 1 ? { id: 1, updated_at: ROW.updated_at } : null,
);
const deleted = vi.fn(async ({ id }: { id: number }) => (id === 1 ? 1 : 0));

Object.assign(service, {
  admin: {
    staff: {
      list,
      count: { first: counted },
      fetch: { first: fetched },
      create: { first: created },
      update: { first: updated },
      delete: deleted,
    },
  },
});

afterEach(() => {
  for (const query of [list, counted, fetched, created, updated, deleted]) {
    query.mockClear();
  }
});

describe("useStaff", () => {
  it("asks the database for one page of the staff, and for how many there are in all", async () => {
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
    expect(counted).toHaveBeenCalledWith(NONE);
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
    expect(counted).toHaveBeenLastCalledWith(NONE);
  });

  it("hands the database the search, and null for each part left out or empty", async () => {
    expect(await useStaff().list({ page: 1, size: 25, q: "ROE" })).toEqual({
      items: [{ ...RECORD, id: 2, name: "John Roe" }],
      total: 1,
    });
    expect(counted).toHaveBeenLastCalledWith({ ...NONE, q: "ROE" });
    await useStaff().list({ page: 1, size: 25, q: "", role: "pastor" });
    expect(list).toHaveBeenLastCalledWith({
      ...NONE,
      ...ORDER,
      role: "pastor",
      size: 25,
      offset: 0,
    });
    await useStaff().list({ page: 1, size: 25, status: "draft" });
    expect(counted).toHaveBeenLastCalledWith({ ...NONE, status: "draft" });
  });

  it("hands the database each day asked for, read in the church's time zone", async () => {
    await useStaff().list({
      page: 1,
      size: 25,
      updatedAtBefore: "2026-10-17",
      updatedAtAfter: "2026-10-01",
      updatedAtOn: "2026-10-10",
      createdAtBefore: "2026-09-17",
      createdAtAfter: "2026-09-01",
      createdAtOn: "2026-09-10",
    });
    expect(counted).toHaveBeenLastCalledWith({
      ...NONE,
      updated_before: "2026-10-17",
      updated_after: "2026-10-01",
      updated_on: "2026-10-10",
      created_before: "2026-09-17",
      created_after: "2026-09-01",
      created_on: "2026-09-10",
    });
  });

  it("counts nothing when the database says nothing", async () => {
    counted.mockResolvedValueOnce(null as never);
    expect(
      await useStaff().list({ page: 1, size: 25, role: "pastor" }),
    ).toEqual({ items: [], total: 0 });
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
      bio: null,
      photo: null,
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

  it("replaces every field of a member, and hands back the record", async () => {
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

  it("removes a member, and says whether there was one", async () => {
    expect(await useStaff().remove(1)).toBe(true);
    expect(deleted).toHaveBeenCalledWith({ id: 1 });
    expect(await useStaff().remove(9)).toBe(false);
  });
});
