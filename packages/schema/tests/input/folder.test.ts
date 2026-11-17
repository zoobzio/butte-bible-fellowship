import { describe, expect, it } from "vitest";

import {
  FOLDER_SORT_KEYS,
  folderBody,
  folderDraft,
  folderId,
  folderPlacement,
  foldersQuery,
} from "../../src/input/folder";

describe("folderId", () => {
  it("names a folder by its row's number, as the address writes it", () => {
    expect(folderId.parse({ id: "3" })).toEqual({ id: 3 });
    expect(folderId.safeParse({ id: "0" }).success).toBe(false);
    expect(folderId.safeParse({ id: "sermons" }).success).toBe(false);
  });
});

describe("foldersQuery", () => {
  it("lists the folders at the top, or those inside the folder it names", () => {
    expect(foldersQuery.parse({})).toEqual({});
    expect(foldersQuery.parse({ parent: "4" })).toEqual({ parent: 4 });
    expect(foldersQuery.safeParse({ parent: "0" }).success).toBe(false);
  });

  it("searches the level's names for a text, trimmed", () => {
    expect(foldersQuery.parse({ parent: "4", q: " romans " })).toEqual({
      parent: 4,
      q: "romans",
    });
    expect(foldersQuery.parse({ q: "" })).toEqual({ q: "" });
  });

  it("sorts by the name, or by what a folder shows under a column, either way", () => {
    for (const sort of FOLDER_SORT_KEYS) {
      expect(foldersQuery.parse({ sort })).toEqual({ sort });
    }
    expect(FOLDER_SORT_KEYS).toEqual([
      "name",
      "size",
      "createdAt",
      "updatedAt",
    ]);
    expect(foldersQuery.parse({ sort: "size", direction: "desc" })).toEqual({
      sort: "size",
      direction: "desc",
    });
    expect(foldersQuery.safeParse({ sort: "count" }).success).toBe(false);
    expect(foldersQuery.safeParse({ direction: "up" }).success).toBe(false);
  });
});

describe("folderBody", () => {
  it("is a folder's name, trimmed, with one left", () => {
    expect(folderBody.parse({ name: " Sermon notes " })).toEqual({
      name: "Sermon notes",
    });
    expect(folderBody.safeParse({ name: "   " }).success).toBe(false);
    expect(folderBody.safeParse({}).success).toBe(false);
  });

  it("carries nothing of where the folder is: that is written on its own", () => {
    expect(folderBody.parse({ name: "News", parent: 4 })).toEqual({
      name: "News",
    });
  });
});

describe("folderPlacement", () => {
  it("puts a folder inside another, or at the top when it names none", () => {
    expect(folderPlacement.parse({ parent: 4 })).toEqual({ parent: 4 });
    expect(folderPlacement.parse({})).toEqual({});
    expect(folderPlacement.safeParse({ parent: 0 }).success).toBe(false);
    expect(folderPlacement.safeParse({ parent: "4" }).success).toBe(false);
  });
});

describe("folderDraft", () => {
  it("is a new folder's name, and where it is made", () => {
    expect(folderDraft.parse({ name: "News" })).toEqual({ name: "News" });
    expect(folderDraft.parse({ name: "News", parent: 4 })).toEqual({
      name: "News",
      parent: 4,
    });
    expect(folderDraft.safeParse({ parent: 4 }).success).toBe(false);
  });
});
