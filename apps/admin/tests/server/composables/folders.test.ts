import { afterEach, describe, expect, it, vi } from "vitest";

import { service } from "@bbf/nuxt/testing/bezoar";
import { useFolders } from "~~/server/composables/folders";

const ROW = {
  id: 3,
  parent_id: null as number | null,
  name: "Sermon notes",
  count: 1,
  created_at: new Date("2026-10-17T18:00:00Z"),
  updated_at: new Date("2026-10-18T09:30:00Z"),
};

const RECORD = {
  id: 3,
  name: "Sermon notes",
  count: 1,
  createdAt: "2026-10-17T18:00:00.000Z",
  updatedAt: "2026-10-18T09:30:00.000Z",
};

/* Folder 3 at the top, folder 4 inside it, and the new one, 5. */
const NESTED = { ...ROW, id: 4, parent_id: 3, name: "Romans", count: 0 };

const list = vi.fn(async ({ parent_id }: { parent_id: number | null }) =>
  parent_id === null ? [ROW] : parent_id === 3 ? [NESTED] : [],
);
const fetched = vi.fn(async ({ id }: { id: number }) =>
  id === 3
    ? ROW
    : id === 4
      ? NESTED
      : id === 5
        ? { ...ROW, id: 5, name: "New" }
        : null,
);
const created = vi.fn(async (_args: { name: string }) => ({
  id: 5,
  created_at: ROW.created_at,
}));
const updated = vi.fn(async ({ id }: { id: number; name: string }) =>
  id === 3 ? { id, updated_at: ROW.updated_at } : null,
);
/* Folder 3 holds folder 4: it moves anywhere but under it, or itself. */
const moved = vi.fn(
  async ({ id, parent_id }: { id: number; parent_id: number | null }) =>
    id === 3 && (parent_id === 3 || parent_id === 4)
      ? null
      : { id, updated_at: ROW.updated_at },
);
/* Folder 3 holds something, and stays; folder 4 holds nothing, and goes. */
const deleted = vi.fn(async ({ id }: { id: number }) => (id === 4 ? 1 : 0));

Object.assign(service, {
  admin: {
    folders: {
      list,
      fetch: { first: fetched },
      create: { first: created },
      update: { first: updated },
      parent: { first: moved },
      delete: deleted,
    },
  },
});

afterEach(() => {
  for (const query of [list, fetched, created, updated, moved, deleted]) {
    query.mockClear();
  }
});

describe("useFolders", () => {
  it("lists the folders at the top, or those inside the folder the query names", async () => {
    expect(await useFolders().list({})).toEqual([RECORD]);
    expect(list).toHaveBeenLastCalledWith({ parent_id: null });
    expect(await useFolders().list({ parent: 3 })).toEqual([
      { ...RECORD, id: 4, parent: 3, name: "Romans", count: 0 },
    ]);
    expect(list).toHaveBeenLastCalledWith({ parent_id: 3 });
  });

  it("fetches one folder by id, or nothing", async () => {
    expect(await useFolders().fetch(3)).toEqual(RECORD);
    expect(await useFolders().fetch(9)).toBeNull();
  });

  it("creates a folder at the top, or inside the one its draft names, and hands back the record", async () => {
    expect(await useFolders().create({ name: "New" })).toMatchObject({
      id: 5,
      name: "New",
    });
    expect(created).toHaveBeenLastCalledWith({ name: "New", parent_id: null });
    await useFolders().create({ name: "New", parent: 3 });
    expect(created).toHaveBeenLastCalledWith({ name: "New", parent_id: 3 });
  });

  it("hands back nothing when nothing was written", async () => {
    created.mockResolvedValueOnce(null as never);
    expect(await useFolders().create({ name: "New" })).toBeNull();
    expect(fetched).not.toHaveBeenCalled();
  });

  it("renames a folder, or nothing when no folder has the id", async () => {
    expect(await useFolders().update(3, { name: "Notes" })).toEqual(RECORD);
    expect(updated).toHaveBeenCalledWith({ id: 3, name: "Notes" });
    expect(await useFolders().update(9, { name: "Notes" })).toBeNull();
  });

  it("moves a folder into another, or to the top when the placement names none", async () => {
    expect(await useFolders().setParent(4, {})).toMatchObject({ id: 4 });
    expect(moved).toHaveBeenLastCalledWith({ id: 4, parent_id: null });
    expect(await useFolders().setParent(4, { parent: 3 })).toMatchObject({
      id: 4,
    });
    expect(moved).toHaveBeenLastCalledWith({ id: 4, parent_id: 3 });
  });

  it("refuses to move a folder into itself or under a folder of its own, and misses one that is not there", async () => {
    expect(await useFolders().setParent(3, { parent: 3 })).toBe("refused");
    expect(await useFolders().setParent(3, { parent: 4 })).toBe("refused");
    moved.mockClear();
    expect(await useFolders().setParent(9, { parent: 3 })).toBe("missing");
    expect(moved).not.toHaveBeenCalled();
  });

  it("says a name is taken, or the folder to be inside gone, when the database refuses the write over it", async () => {
    const refused = (constraint: string) =>
      new Error("the query failed", { cause: { constraint } });
    created.mockRejectedValueOnce(refused("folders_parent_id_name_key"));
    expect(await useFolders().create({ name: "Sermon notes" })).toBe("taken");
    created.mockRejectedValueOnce(refused("folders_parent_id_fkey"));
    expect(await useFolders().create({ name: "New", parent: 9 })).toBe("gone");
    updated.mockRejectedValueOnce(refused("folders_parent_id_name_key"));
    expect(await useFolders().update(3, { name: "Romans" })).toBe("taken");
    moved.mockRejectedValueOnce(refused("folders_parent_id_name_key"));
    expect(await useFolders().setParent(4, {})).toBe("taken");
    moved.mockRejectedValueOnce(refused("folders_parent_id_fkey"));
    expect(await useFolders().setParent(4, { parent: 9 })).toBe("gone");
  });

  it("throws on whatever else fails a write", async () => {
    created.mockRejectedValueOnce(new Error("down"));
    await expect(useFolders().create({ name: "New" })).rejects.toThrow("down");
  });

  it("removes a folder that holds nothing, refuses one that holds anything, and misses one that is not there", async () => {
    expect(await useFolders().remove(4)).toBe(true);
    expect(await useFolders().remove(3)).toBe("refused");
    deleted.mockClear();
    expect(await useFolders().remove(9)).toBe("missing");
    expect(deleted).not.toHaveBeenCalled();
  });
});
