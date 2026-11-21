import { describe, expect, it } from "vitest";

import {
  FOLDER_SORT_KEYS,
  folderBody,
  folderSort,
} from "../../src/input/folder";

describe("folderSort", () => {
  it("is the name, or what a folder shows under a column", () => {
    for (const sort of FOLDER_SORT_KEYS) {
      expect(folderSort.parse(sort)).toBe(sort);
    }
    expect(FOLDER_SORT_KEYS).toEqual([
      "name",
      "size",
      "createdAt",
      "updatedAt",
    ]);
    expect(folderSort.safeParse("count").success).toBe(false);
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

  it("is one step of a path: nothing in it an address reads as something else, and neither . nor ..", () => {
    for (const name of [
      "a/b",
      "/",
      "Sermons/",
      "a\\b",
      "Q&A?",
      "Été #1",
      "50% off",
      ".",
      "..",
      " .. ",
    ]) {
      expect(folderBody.safeParse({ name }).success, name).toBe(false);
    }
    // A dot is a letter anywhere else, and so is whatever else an address
    // encodes.
    for (const name of ["v1.2", "...", ".hidden", "Q&A!", "2026", "Été + 1"]) {
      expect(folderBody.parse({ name }), name).toEqual({ name });
    }
  });

  it("carries nothing of where the folder is: its path says that", () => {
    expect(folderBody.parse({ name: "News", parent: 4 })).toEqual({
      name: "News",
    });
  });
});
