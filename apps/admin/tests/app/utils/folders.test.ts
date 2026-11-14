import { describe, expect, it } from "vitest";

import { NOTES, ROMANS } from "#test/support/records";
import {
  folderId,
  folderOf,
  toBrowserFolder,
  toContentQuery,
  toFoldersQuery,
} from "~/utils/folders";

const UNSORTED = { sortField: null, sortDirection: "asc" as const };

describe("toBrowserFolder", () => {
  it("names a folder by its id, as text, with its name and what it holds", () => {
    expect(toBrowserFolder(NOTES)).toEqual({
      key: "2",
      label: "Sermon notes",
      count: 1,
    });
    expect(toBrowserFolder(ROMANS)).toEqual({
      key: "3",
      label: "Romans",
      count: 0,
    });
  });
});

describe("folderId", () => {
  it("reads a folder's id back from its key", () => {
    expect(folderId(toBrowserFolder(ROMANS))).toBe(3);
  });
});

describe("folderOf", () => {
  it("is the folder a trail ends in, and none at the top", () => {
    expect(folderOf([])).toBeUndefined();
    expect(folderOf(["2"])).toBe(2);
    expect(folderOf(["2", "3"])).toBe(3);
  });
});

describe("toFoldersQuery", () => {
  it("asks for the folders inside the open one, or the top's with nothing", () => {
    expect(toFoldersQuery({ path: [] })).toEqual({});
    expect(toFoldersQuery({ path: ["2", "3"] })).toEqual({ parent: 3 });
  });
});

describe("toContentQuery", () => {
  it("asks for the documents filed in the open folder, or the top's with nothing", () => {
    expect(toContentQuery({ path: [], ...UNSORTED })).toEqual({});
    expect(toContentQuery({ path: ["2"], ...UNSORTED })).toEqual({ folder: 2 });
  });

  it("carries the sort the browser holds, and its direction with it", () => {
    expect(
      toContentQuery({
        path: ["2"],
        sortField: "title",
        sortDirection: "desc",
      }),
    ).toEqual({ folder: 2, sort: "title", direction: "desc" });
  });
});
