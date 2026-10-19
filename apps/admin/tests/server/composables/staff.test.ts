import { afterEach, describe, expect, it, vi } from "vitest";

import { service } from "#test/mocks/bezoar";
import { useStaff } from "~~/server/composables/staff";

/** A row as `admin.staff.list` and `admin.staff.fetch` return it. */
const ROW = {
  id: 1,
  slug: "jane-doe",
  name: "Jane Doe",
  role: "Elder",
  summary: null,
  bio: "## Jane",
  photo: null,
  email: "jane@example.com",
  phone: null,
  position: 2,
  status: "published" as const,
  created_at: new Date("2026-10-17T18:00:00Z"),
  updated_at: new Date("2026-10-18T09:30:00Z"),
};

/** The same, as the API serves it. */
const RECORD = {
  id: 1,
  slug: "jane-doe",
  name: "Jane Doe",
  role: "Elder",
  bio: "## Jane",
  email: "jane@example.com",
  position: 2,
  status: "published",
  createdAt: "2026-10-17T18:00:00.000Z",
  updatedAt: "2026-10-18T09:30:00.000Z",
};

const ROWS = [ROW, { ...ROW, id: 2, slug: "john-roe", name: "John Roe" }];

const list = vi.fn(async () => ROWS);
const fetched = vi.fn(async ({ id }: { id: number }) =>
  id === 3
    ? { ...ROW, id: 3, slug: "new", name: "New", status: "draft" as const }
    : (ROWS.find((row) => row.id === id) ?? null),
);
const created = vi.fn(async (args: { slug: string }) => ({
  id: 3,
  slug: args.slug,
  created_at: ROW.created_at,
}));
const updated = vi.fn(async (args: { id: number; slug: string }) =>
  args.id === 1 ? { id: 1, slug: args.slug, updated_at: ROW.updated_at } : null,
);
const deleted = vi.fn(async ({ id }: { id: number }) => (id === 1 ? 1 : 0));

// The service is the stub the module's shim keeps; the admin's staff queries
// are given to it here, the shape the built service has them in.
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
      items: [{ ...RECORD, id: 2, slug: "john-roe", name: "John Roe" }],
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
      slug: "new",
      name: "New",
      role: "Deacon",
      position: 0,
      status: "draft",
    });
    expect(created).toHaveBeenCalledWith({
      slug: "new",
      name: "New",
      role: "Deacon",
      summary: null,
      bio: null,
      photo: null,
      email: null,
      phone: null,
      position: 0,
      status: "draft",
    });
    expect(record).toMatchObject({ id: 3, slug: "new", status: "draft" });
  });

  it("hands back nothing when nothing was written", async () => {
    created.mockResolvedValueOnce(null as never);
    expect(
      await useStaff().create({
        slug: "new",
        name: "New",
        role: "Deacon",
        position: 0,
        status: "draft",
      }),
    ).toBeNull();
  });

  it("replaces every field of a member, and hands back the record", async () => {
    const record = await useStaff().update(1, {
      slug: "jane-doe",
      name: "Jane Doe",
      role: "Pastor",
      position: 1,
      status: "published",
    });
    expect(updated).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, role: "Pastor", summary: null }),
    );
    expect(record).toEqual(RECORD);
    expect(fetched).toHaveBeenCalledWith({ id: 1 });
  });

  it("updates nothing when no member has the id", async () => {
    expect(
      await useStaff().update(9, {
        slug: "x",
        name: "x",
        role: "x",
        position: 0,
        status: "draft",
      }),
    ).toBeNull();
    expect(fetched).not.toHaveBeenCalled();
  });

  it("removes a member, and says whether there was one", async () => {
    expect(await useStaff().remove(1)).toBe(true);
    expect(deleted).toHaveBeenCalledWith({ id: 1 });
    expect(await useStaff().remove(9)).toBe(false);
  });
});
