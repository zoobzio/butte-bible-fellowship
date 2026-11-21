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

const RECORD = {
  id: 3,
  mime: "application/vnd.bbf.article+json",
  slug: "about-us",
  title: "About Us",
  size: 0,
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

type Order = { sort: string | null; direction: string };

const ORDER: Order = { sort: null, direction: "asc" };

const TEXT_OPERATORS = [
  "contains",
  "not_contains",
  "starts_with",
  "ends_with",
  "is",
  "not",
] as const;

const DAY_OPERATORS = [
  "before",
  "after",
  "on",
  "on_or_after",
  "on_or_before",
] as const;

/* Every part of the search left out: null, but for the time zone. */
const NONE: Record<string, string | null> = {
  q: null,
  tz: "America/Los_Angeles",
  ...Object.fromEntries([
    ...["title", "slug", "mime"].flatMap((column) =>
      TEXT_OPERATORS.map((operator) => [`${column}_${operator}`, null]),
    ),
    ...DAY_OPERATORS.map((operator) => [`updated_${operator}`, null]),
  ]),
};

/* The pages filed in one folder: the two at the top, and none anywhere else. */
const list = vi.fn(
  async ({ folder_id }: Order & { folder_id: number | null }) =>
    folder_id === null ? ROWS : [],
);

/* One page, whose body and folder the queries read and write. */
const held = { body: null as unknown, folder_id: null as number | null };
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
const filed = vi.fn(
  async ({ id, folder_id }: { id: number; folder_id: number | null }) => {
    if (id !== 3) return null;
    held.folder_id = folder_id;
    return { id, folder_id };
  },
);
const deleted = vi.fn(async ({ id }: { id: number }) => (id === 3 ? 1 : 0));

Object.assign(service, {
  admin: {
    content: {
      list,
      fetch: { first: fetched },
      create: { first: created },
      update: { first: updated },
      body: { first: written },
      folder: { first: filed },
      delete: deleted,
    },
  },
});

afterEach(() => {
  held.body = null;
  held.folder_id = null;
  for (const query of [
    list,
    fetched,
    created,
    updated,
    written,
    filed,
    deleted,
  ]) {
    query.mockClear();
  }
});

describe("useContent", () => {
  it("asks the database for the pages at the top, or those filed in the folder named", async () => {
    expect(await useContent().list(undefined, {})).toEqual([RECORD, HOME]);
    expect(list).toHaveBeenCalledTimes(1);
    expect(list).toHaveBeenCalledWith({ folder_id: null, ...NONE, ...ORDER });
    expect(await useContent().list(7, {})).toEqual([]);
    expect(list).toHaveBeenLastCalledWith({ folder_id: 7, ...NONE, ...ORDER });
  });

  it("searches the folder for the text and the filters the query carries, each as the list query names it, in the church's time", async () => {
    await useContent().list(7, {
      q: "vision",
      titleContains: "about",
      titleNot: "Welcome",
      slugStartsWith: "about",
      mimeStartsWith: "image/",
      updatedAtOnOrAfter: "2026-10-01",
      updatedAtBefore: "2026-11-01",
    });
    expect(list).toHaveBeenLastCalledWith({
      folder_id: 7,
      ...NONE,
      q: "vision",
      title_contains: "about",
      title_not: "Welcome",
      slug_starts_with: "about",
      mime_starts_with: "image/",
      updated_on_or_after: "2026-10-01",
      updated_before: "2026-11-01",
      ...ORDER,
    });
    // Nothing typed is no search.
    await useContent().list(undefined, { q: "" });
    expect(list).toHaveBeenLastCalledWith({
      folder_id: null,
      ...NONE,
      ...ORDER,
    });
  });

  it("asks for the sort the query names, by the row's column, ascending unless told", async () => {
    await useContent().list(undefined, { sort: "title" });
    expect(list).toHaveBeenLastCalledWith({
      folder_id: null,
      ...NONE,
      sort: "title",
      direction: "asc",
    });
    await useContent().list(7, { sort: "updatedAt", direction: "desc" });
    expect(list).toHaveBeenLastCalledWith({
      folder_id: 7,
      ...NONE,
      sort: "updated_at",
      direction: "desc",
    });
    await useContent().list(undefined, { sort: "slug" });
    expect(list).toHaveBeenLastCalledWith(
      expect.objectContaining({ sort: "slug" }),
    );
    await useContent().list(undefined, { sort: "createdAt" });
    expect(list).toHaveBeenLastCalledWith(
      expect.objectContaining({ sort: "created_at" }),
    );
    await useContent().list(undefined, { sort: "mime" });
    expect(list).toHaveBeenLastCalledWith(
      expect.objectContaining({ sort: "mime" }),
    );
    await useContent().list(undefined, { sort: "size" });
    expect(list).toHaveBeenLastCalledWith(
      expect.objectContaining({ sort: "size" }),
    );
  });

  it("fetches one page by id, or nothing", async () => {
    expect(await useContent().fetch(3)).toEqual(RECORD);
    expect(await useContent().fetch(9)).toBeNull();
  });

  it("creates a page from its metadata, at the top, and hands back the record", async () => {
    const record = await useContent().create({
      slug: "new",
      title: "New",
      description: "A new page.",
    });
    expect(created).toHaveBeenCalledWith({
      slug: "new",
      title: "New",
      description: "A new page.",
      folder_id: null,
    });
    expect(fetched).toHaveBeenCalledWith({ id: 5 });
    expect(record).toMatchObject({ id: 5, slug: "new" });
  });

  it("creates a page in the folder named", async () => {
    await useContent().create({ slug: "new", title: "New" }, 7);
    expect(created).toHaveBeenCalledWith(
      expect.objectContaining({ folder_id: 7 }),
    );
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

  it("files a page in a folder on its own, or at the top when none is named", async () => {
    expect(await useContent().setFolder(3, 7)).toEqual({
      ...RECORD,
      folder: 7,
    });
    expect(filed).toHaveBeenLastCalledWith({ id: 3, folder_id: 7 });
    expect(await useContent().setFolder(3)).toEqual(RECORD);
    expect(filed).toHaveBeenLastCalledWith({ id: 3, folder_id: null });
  });

  it("files nothing when no page has the id", async () => {
    expect(await useContent().setFolder(9, 7)).toBeNull();
    expect(fetched).not.toHaveBeenCalled();
  });

  it("says the folder is gone when the database refuses to file a page in it", async () => {
    const refused = () =>
      new Error("the query failed", {
        cause: { constraint: "content_folder_id_fkey" },
      });
    created.mockRejectedValueOnce(refused());
    expect(await useContent().create({ slug: "new", title: "New" }, 9)).toBe(
      "gone",
    );
    filed.mockRejectedValueOnce(refused());
    expect(await useContent().setFolder(3, 9)).toBe("gone");
    filed.mockRejectedValueOnce(new Error("down"));
    await expect(useContent().setFolder(3, 9)).rejects.toThrow("down");
  });

  it("says a slug is taken, by a page anywhere or by a folder beside it, when the database refuses the write over it", async () => {
    const refused = (constraint: string) =>
      new Error("the query failed", { cause: { constraint } });
    const body = { slug: "index", title: "Home" };
    for (const constraint of ["content_slug_key", "content_path_taken"]) {
      created.mockRejectedValueOnce(refused(constraint));
      expect(await useContent().create(body), constraint).toBe("taken");
      updated.mockRejectedValueOnce(refused(constraint));
      expect(await useContent().update(3, body), constraint).toBe("taken");
    }
    // A page filed where a folder of its name already is.
    filed.mockRejectedValueOnce(refused("content_path_taken"));
    expect(await useContent().setFolder(3, 7)).toBe("taken");
    expect(fetched).not.toHaveBeenCalled();
    // Whatever else fails a write is thrown on.
    updated.mockRejectedValueOnce(new Error("down"));
    await expect(useContent().update(3, body)).rejects.toThrow("down");
  });

  it("removes a page, and says whether there was one", async () => {
    expect(await useContent().remove(3)).toBe(true);
    expect(await useContent().remove(9)).toBe(false);
    expect(deleted).toHaveBeenCalledWith({ id: 3 });
  });
});
