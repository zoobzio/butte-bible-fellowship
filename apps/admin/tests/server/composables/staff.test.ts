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

const list = vi.fn(async () => ROWS);
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
      fetch: { first: fetched },
      create: { first: created },
      update: { first: updated },
      delete: deleted,
    },
  },
});

afterEach(() => {
  for (const query of [list, fetched, created, updated, deleted]) {
    query.mockClear();
  }
});

describe("useStaff", () => {
  it("lists one page of the staff as the API serves them, and counts them all", async () => {
    expect(await useStaff().list({ page: 1, size: 1 })).toEqual({
      items: [RECORD],
      total: 2,
    });
    expect(await useStaff().list({ page: 2, size: 1 })).toEqual({
      items: [{ ...RECORD, id: 2, name: "John Roe" }],
      total: 2,
    });
    expect(list).toHaveBeenCalledTimes(2);
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
