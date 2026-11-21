import { afterEach, describe, expect, it, vi } from "vitest";

import { service } from "@bbf/nuxt/testing/bezoar";
import { useContentTree } from "~~/server/composables/tree";

const FOLDER_ROW = {
  id: 3,
  parent_id: null as number | null,
  name: "Sermon notes",
  count: 2,
  size: 4096,
  created_at: new Date("2026-10-17T18:00:00Z"),
  updated_at: new Date("2026-10-18T09:30:00Z"),
};

/* Folder 3 at the top, and folder 4, Romans, inside it. */
const ROMANS_ROW = {
  ...FOLDER_ROW,
  id: 4,
  parent_id: 3,
  name: "Romans",
  count: 0,
};

const NOTES = {
  id: 3,
  name: "Sermon notes",
  count: 2,
  size: 4096,
  createdAt: "2026-10-17T18:00:00.000Z",
  updatedAt: "2026-10-18T09:30:00.000Z",
};

const ROMANS = { ...NOTES, id: 4, parent: 3, name: "Romans", count: 0 };

const PAGE_ROW = {
  id: 7,
  mime: "application/vnd.bbf.article+json",
  slug: "about-us",
  title: "About Us",
  folder_id: null as number | null,
  description: null as string | null,
  body: null as unknown,
  size: 0,
  created_at: new Date("2026-10-17T18:00:00Z"),
  updated_at: new Date("2026-10-18T09:30:00Z"),
};

/* Page 7 at the top, and page 8, an outline, filed in folder 3. */
const OUTLINE_ROW = {
  ...PAGE_ROW,
  id: 8,
  slug: "outline",
  title: "Outline",
  folder_id: 3,
};

const ABOUT = {
  id: 7,
  mime: "application/vnd.bbf.article+json",
  slug: "about-us",
  title: "About Us",
  size: 0,
  createdAt: "2026-10-17T18:00:00.000Z",
  updatedAt: "2026-10-18T09:30:00.000Z",
};

const OUTLINE = {
  ...ABOUT,
  id: 8,
  slug: "outline",
  title: "Outline",
  folder: 3,
};

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

/* The folders, each under the id of the one it is inside, the top's null. */
const LEVELS: Record<string, Record<string, number>> = {
  null: { "Sermon notes": 3 },
  3: { Romans: 4 },
};

/* The walk of a path of names: a row to each folder found, until one is not. */
const walk = vi.fn(async ({ path }: { path: unknown }) => {
  const steps: { depth: number; id: number }[] = [];
  let parent: number | null = null;
  for (const name of JSON.parse(path as string) as string[]) {
    const id: number | undefined = LEVELS[String(parent)]?.[name];
    if (id === undefined) break;
    steps.push({ depth: steps.length + 1, id });
    parent = id;
  }
  return steps;
});

const folderRows = vi.fn(async ({ parent_id }: { parent_id: number | null }) =>
  parent_id === null ? [FOLDER_ROW] : parent_id === 3 ? [ROMANS_ROW] : [],
);
const folderRow = vi.fn(async ({ id }: { id: number }) =>
  id === 3
    ? FOLDER_ROW
    : id === 4
      ? ROMANS_ROW
      : id === 5
        ? { ...FOLDER_ROW, id: 5, name: "New" }
        : null,
);
const folderMade = vi.fn(async (_args: { name: string }) => ({
  id: 5,
  created_at: FOLDER_ROW.created_at,
}));
/* Folder 3 holds folder 4: it moves anywhere but under it, or itself. */
const folderMoved = vi.fn(
  async ({ id, parent_id }: { id: number; parent_id: number | null }) =>
    id === 3 && (parent_id === 3 || parent_id === 4)
      ? null
      : { id, updated_at: FOLDER_ROW.updated_at },
);
/* Folder 3 holds something, and stays; folder 4 holds nothing, and goes. */
const folderGone = vi.fn(async ({ id }: { id: number }) => (id === 4 ? 1 : 0));

const located = vi.fn(
  async ({ folder_id, slug }: { folder_id: number | null; slug: string }) =>
    folder_id === null && slug === "about-us"
      ? { id: 7 }
      : folder_id === 3 && slug === "outline"
        ? { id: 8 }
        : null,
);
const pageRows = vi.fn(async ({ folder_id }: { folder_id: number | null }) =>
  folder_id === null ? [PAGE_ROW] : folder_id === 3 ? [OUTLINE_ROW] : [],
);
const pageRow = vi.fn(async ({ id }: { id: number }) =>
  id === 7
    ? PAGE_ROW
    : id === 8
      ? OUTLINE_ROW
      : id === 9
        ? { ...PAGE_ROW, id: 9, slug: "new", title: "New" }
        : null,
);
const pageMade = vi.fn(async (args: { slug: string }) => ({
  id: 9,
  slug: args.slug,
  created_at: PAGE_ROW.created_at,
}));
const pageWritten = vi.fn(async ({ id }: { id: number; body: unknown }) => ({
  id,
  updated_at: PAGE_ROW.updated_at,
}));
const pageFiled = vi.fn(
  async ({ id, folder_id }: { id: number; folder_id: number | null }) => ({
    id,
    folder_id,
  }),
);
const pageGone = vi.fn(async (_args: { id: number }) => 1);

Object.assign(service, {
  admin: {
    folders: {
      walk,
      list: folderRows,
      fetch: { first: folderRow },
      create: { first: folderMade },
      parent: { first: folderMoved },
      delete: folderGone,
    },
    content: {
      locate: { first: located },
      list: pageRows,
      fetch: { first: pageRow },
      create: { first: pageMade },
      body: { first: pageWritten },
      folder: { first: pageFiled },
      delete: pageGone,
    },
  },
});

const QUERIES = [
  walk,
  folderRows,
  folderRow,
  folderMade,
  folderMoved,
  folderGone,
  located,
  pageRows,
  pageRow,
  pageMade,
  pageWritten,
  pageFiled,
  pageGone,
];

afterEach(() => {
  for (const query of QUERIES) query.mockClear();
});

describe("useContentTree", () => {
  describe("locate", () => {
    it("names the top by the path of no steps, with nothing asked", async () => {
      expect(await useContentTree().locate([])).toEqual({ kind: "folder" });
      expect(walk).not.toHaveBeenCalled();
      expect(located).not.toHaveBeenCalled();
    });

    it("names a folder where every name of the path is a folder's, the walk asked with the names as JSON", async () => {
      expect(await useContentTree().locate(["Sermon notes"])).toEqual({
        kind: "folder",
        id: 3,
      });
      expect(walk).toHaveBeenLastCalledWith({ path: '["Sermon notes"]' });
      expect(await useContentTree().locate(["Sermon notes", "Romans"])).toEqual(
        { kind: "folder", id: 4 },
      );
      expect(walk).toHaveBeenLastCalledWith({
        path: '["Sermon notes","Romans"]',
      });
      expect(located).not.toHaveBeenCalled();
    });

    it("names a document where every name but the last is a folder's, by its slug in the folder they come to", async () => {
      expect(
        await useContentTree().locate(["Sermon notes", "outline"]),
      ).toEqual({ kind: "document", id: 8 });
      expect(located).toHaveBeenLastCalledWith({
        folder_id: 3,
        slug: "outline",
      });
      // At the top, it is filed in no folder.
      expect(await useContentTree().locate(["about-us"])).toEqual({
        kind: "document",
        id: 7,
      });
      expect(located).toHaveBeenLastCalledWith({
        folder_id: null,
        slug: "about-us",
      });
    });

    it("names nothing where no document has the last name, there", async () => {
      expect(await useContentTree().locate(["nowhere"])).toBeNull();
      // A document is found where it is filed, and nowhere else.
      expect(
        await useContentTree().locate(["Sermon notes", "about-us"]),
      ).toBeNull();
      expect(located).toHaveBeenLastCalledWith({
        folder_id: 3,
        slug: "about-us",
      });
    });

    it("names nothing where the walk stops short of the last name but one, and looks for no document", async () => {
      expect(
        await useContentTree().locate(["Galatians", "outline"]),
      ).toBeNull();
      expect(
        await useContentTree().locate(["Sermon notes", "Galatians", "outline"]),
      ).toBeNull();
      expect(located).not.toHaveBeenCalled();
    });
  });

  describe("read", () => {
    it("reads a document as itself", async () => {
      expect(
        await useContentTree().read(["Sermon notes", "outline"], {}),
      ).toEqual({ kind: "document", record: OUTLINE });
      expect(pageRow).toHaveBeenCalledWith({ id: 8 });
      expect(pageRows).not.toHaveBeenCalled();
      expect(folderRows).not.toHaveBeenCalled();
    });

    it("reads a folder with what it holds, its folders and its documents asked for by the one query", async () => {
      const query = { q: "romans", sort: "title", direction: "desc" } as const;
      expect(await useContentTree().read(["Sermon notes"], query)).toEqual({
        kind: "folder",
        folder: NOTES,
        folders: [ROMANS],
        files: [OUTLINE],
      });
      expect(folderRow).toHaveBeenCalledWith({ id: 3 });
      // The folders by their name, which is what the title is of them.
      expect(folderRows).toHaveBeenCalledWith({
        parent_id: 3,
        q: "romans",
        sort: "name",
        direction: "desc",
      });
      expect(pageRows).toHaveBeenCalledWith(
        expect.objectContaining({
          folder_id: 3,
          q: "romans",
          sort: "title",
          direction: "desc",
        }),
      );
    });

    it("reads the top as a folder that is no folder itself", async () => {
      const top = await useContentTree().read([], {});
      expect(top).toEqual({
        kind: "folder",
        folder: undefined,
        folders: [NOTES],
        files: [ABOUT],
      });
      expect(folderRow).not.toHaveBeenCalled();
      expect(folderRows).toHaveBeenCalledWith(
        expect.objectContaining({ parent_id: null }),
      );
      expect(pageRows).toHaveBeenCalledWith(
        expect.objectContaining({ folder_id: null }),
      );
    });

    it("reads nothing where the path names nothing", async () => {
      expect(await useContentTree().read(["nowhere"], {})).toBeNull();
      expect(pageRow).not.toHaveBeenCalled();
      expect(pageRows).not.toHaveBeenCalled();
    });

    it("reads nothing where what the path named is gone by the time it is read", async () => {
      pageRow.mockResolvedValueOnce(null);
      expect(await useContentTree().read(["about-us"], {})).toBeNull();
      folderRow.mockResolvedValueOnce(null);
      expect(await useContentTree().read(["Sermon notes"], {})).toBeNull();
    });
  });

  describe("create", () => {
    it("makes a folder in the folder the path names, or at the top, by its name alone", async () => {
      expect(
        await useContentTree().create(["Sermon notes"], {
          kind: "folder",
          name: "New",
        }),
      ).toMatchObject({ id: 5, name: "New" });
      expect(folderMade).toHaveBeenLastCalledWith({
        name: "New",
        parent_id: 3,
      });
      await useContentTree().create([], { kind: "folder", name: "New" });
      expect(folderMade).toHaveBeenLastCalledWith({
        name: "New",
        parent_id: null,
      });
      expect(pageMade).not.toHaveBeenCalled();
    });

    it("makes a document in the folder the path names, or at the top, by its metadata alone", async () => {
      expect(
        await useContentTree().create(["Sermon notes"], {
          kind: "document",
          slug: "new",
          title: "New",
          description: "A new page.",
        }),
      ).toMatchObject({ id: 9, slug: "new" });
      // What kind it is says which is made, and is no part of it.
      expect(pageMade).toHaveBeenLastCalledWith({
        slug: "new",
        title: "New",
        description: "A new page.",
        folder_id: 3,
      });
      await useContentTree().create([], {
        kind: "document",
        slug: "new",
        title: "New",
      });
      expect(pageMade).toHaveBeenLastCalledWith({
        slug: "new",
        title: "New",
        description: null,
        folder_id: null,
      });
      expect(folderMade).not.toHaveBeenCalled();
    });

    it("misses a path that names no folder: nothing, or a document", async () => {
      const entry = { kind: "folder", name: "New" } as const;
      expect(await useContentTree().create(["nowhere"], entry)).toBe("missing");
      expect(await useContentTree().create(["about-us"], entry)).toBe(
        "missing",
      );
      expect(folderMade).not.toHaveBeenCalled();
    });

    it("hands on what the write is refused over", async () => {
      folderMade.mockRejectedValueOnce(
        new Error("the query failed", {
          cause: { constraint: "folders_parent_id_name_key" },
        }),
      );
      expect(
        await useContentTree().create([], { kind: "folder", name: "Romans" }),
      ).toBe("taken");
      pageMade.mockRejectedValueOnce(
        new Error("the query failed", {
          cause: { constraint: "content_slug_key" },
        }),
      );
      expect(
        await useContentTree().create([], {
          kind: "document",
          slug: "about-us",
          title: "About",
        }),
      ).toBe("taken");
    });
  });

  describe("move", () => {
    it("moves a folder into the folder another path names, or to the top", async () => {
      expect(
        await useContentTree().move(["Sermon notes", "Romans"], []),
      ).toMatchObject({ id: 4 });
      expect(folderMoved).toHaveBeenLastCalledWith({ id: 4, parent_id: null });
      await useContentTree().move(["Sermon notes", "Romans"], ["Sermon notes"]);
      expect(folderMoved).toHaveBeenLastCalledWith({ id: 4, parent_id: 3 });
      expect(pageFiled).not.toHaveBeenCalled();
    });

    it("files a document in the folder another path names, or at the top", async () => {
      expect(
        await useContentTree().move(["about-us"], ["Sermon notes", "Romans"]),
      ).toEqual(ABOUT);
      expect(pageFiled).toHaveBeenLastCalledWith({ id: 7, folder_id: 4 });
      await useContentTree().move(["Sermon notes", "outline"], []);
      expect(pageFiled).toHaveBeenLastCalledWith({ id: 8, folder_id: null });
      expect(folderMoved).not.toHaveBeenCalled();
    });

    it("misses a path that names nothing, and the top, which is never moved", async () => {
      expect(await useContentTree().move(["nowhere"], [])).toBe("missing");
      expect(await useContentTree().move([], ["Sermon notes"])).toBe("missing");
      expect(folderMoved).not.toHaveBeenCalled();
      expect(pageFiled).not.toHaveBeenCalled();
    });

    it("misses a document that is gone by the time it is filed", async () => {
      pageFiled.mockResolvedValueOnce(null as never);
      expect(await useContentTree().move(["about-us"], [])).toBe("missing");
    });

    it("says the folder is gone when the second path names none: nothing, or a document", async () => {
      expect(await useContentTree().move(["about-us"], ["nowhere"])).toBe(
        "gone",
      );
      expect(
        await useContentTree().move(
          ["Sermon notes", "Romans"],
          ["Sermon notes", "outline"],
        ),
      ).toBe("gone");
      expect(folderMoved).not.toHaveBeenCalled();
      expect(pageFiled).not.toHaveBeenCalled();
    });

    it("hands on a folder's refusal to be moved into itself or under a folder of its own", async () => {
      expect(
        await useContentTree().move(["Sermon notes"], ["Sermon notes"]),
      ).toBe("refused");
      expect(
        await useContentTree().move(
          ["Sermon notes"],
          ["Sermon notes", "Romans"],
        ),
      ).toBe("refused");
    });
  });

  describe("write", () => {
    it("writes what is written on the document the path names, or clears it", async () => {
      expect(
        await useContentTree().write(["about-us"], { body: BODY }),
      ).toEqual(ABOUT);
      expect(pageWritten).toHaveBeenLastCalledWith({ id: 7, body: BODY });
      await useContentTree().write(["Sermon notes", "outline"], {});
      expect(pageWritten).toHaveBeenLastCalledWith({ id: 8, body: null });
    });

    it("misses a path that names nothing, or a document gone by the time it is written", async () => {
      expect(await useContentTree().write(["nowhere"], { body: BODY })).toBe(
        "missing",
      );
      expect(pageWritten).not.toHaveBeenCalled();
      pageWritten.mockResolvedValueOnce(null as never);
      expect(await useContentTree().write(["about-us"], { body: BODY })).toBe(
        "missing",
      );
    });

    it("refuses a folder, the top among them, on which nothing is written", async () => {
      expect(
        await useContentTree().write(["Sermon notes"], { body: BODY }),
      ).toBe("refused");
      expect(await useContentTree().write([], { body: BODY })).toBe("refused");
      expect(pageWritten).not.toHaveBeenCalled();
    });
  });

  describe("remove", () => {
    it("removes the document a path names", async () => {
      expect(await useContentTree().remove(["Sermon notes", "outline"])).toBe(
        true,
      );
      expect(pageGone).toHaveBeenCalledWith({ id: 8 });
      expect(folderGone).not.toHaveBeenCalled();
    });

    it("removes a folder that holds nothing, and refuses one that holds anything", async () => {
      expect(await useContentTree().remove(["Sermon notes", "Romans"])).toBe(
        true,
      );
      expect(folderGone).toHaveBeenLastCalledWith({ id: 4 });
      expect(await useContentTree().remove(["Sermon notes"])).toBe("refused");
      expect(pageGone).not.toHaveBeenCalled();
    });

    it("misses a path that names nothing, the top, which is never removed, and a document already gone", async () => {
      expect(await useContentTree().remove(["nowhere"])).toBe("missing");
      expect(await useContentTree().remove([])).toBe("missing");
      expect(pageGone).not.toHaveBeenCalled();
      expect(folderGone).not.toHaveBeenCalled();
      pageGone.mockResolvedValueOnce(0);
      expect(await useContentTree().remove(["about-us"])).toBe("missing");
    });
  });
});
