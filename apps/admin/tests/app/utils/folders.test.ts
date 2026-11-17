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

/* Nothing searched for: no text, and no column filtered. */
const UNSEARCHED = { query: "", filters: [] };

describe("toBrowserFolder", () => {
  it("names a folder by its id, as text, with its name and what it holds", () => {
    expect(toBrowserFolder(NOTES)).toMatchObject({
      key: "2",
      label: "Sermon notes",
      count: 1,
    });
    expect(toBrowserFolder(ROMANS)).toMatchObject({
      key: "3",
      label: "Romans",
      count: 0,
    });
  });

  it("shows, under the documents' columns, what all that is under it comes to: its size and when the last of it was changed", () => {
    expect(toBrowserFolder(NOTES).values).toEqual({
      size: 4096,
      updatedAt: "2026-10-18T09:30:00.000Z",
    });
    expect(toBrowserFolder(ROMANS).values).toEqual({
      size: 0,
      updatedAt: "2026-10-17T18:00:00.000Z",
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
    expect(toFoldersQuery({ path: [], query: "", ...UNSORTED })).toEqual({});
    expect(
      toFoldersQuery({ path: ["2", "3"], query: "", ...UNSORTED }),
    ).toEqual({
      parent: 3,
    });
  });

  it("carries the free text as q, for the folders it names", () => {
    expect(toFoldersQuery({ path: [], query: "romans", ...UNSORTED })).toEqual({
      q: "romans",
    });
    expect(
      toFoldersQuery({ path: ["2"], query: "romans", ...UNSORTED }),
    ).toEqual({
      parent: 2,
      q: "romans",
    });
  });

  it("carries the sort where a folder has something to be sorted by: its name under the title, and its own size and dates", () => {
    const sorted = (sortField: string, sortDirection: "asc" | "desc" = "asc") =>
      toFoldersQuery({ path: [], query: "", sortField, sortDirection });
    expect(sorted("title", "desc")).toEqual({
      sort: "name",
      direction: "desc",
    });
    expect(sorted("size")).toEqual({ sort: "size", direction: "asc" });
    expect(sorted("updatedAt", "desc")).toEqual({
      sort: "updatedAt",
      direction: "desc",
    });
    expect(sorted("createdAt")).toEqual({
      sort: "createdAt",
      direction: "asc",
    });
    // Under any other column the folders stay in their own order.
    expect(sorted("slug", "desc")).toEqual({});
    expect(sorted("mime")).toEqual({});
  });
});

describe("toContentQuery", () => {
  it("asks for the documents filed in the open folder, or the top's with nothing", () => {
    expect(toContentQuery({ path: [], ...UNSORTED, ...UNSEARCHED })).toEqual(
      {},
    );
    expect(toContentQuery({ path: ["2"], ...UNSORTED, ...UNSEARCHED })).toEqual(
      { folder: 2 },
    );
  });

  it("carries the sort the browser holds, and its direction with it", () => {
    expect(
      toContentQuery({
        path: ["2"],
        sortField: "title",
        sortDirection: "desc",
        ...UNSEARCHED,
      }),
    ).toEqual({ folder: 2, sort: "title", direction: "desc" });
  });

  it("carries the free text as q, and each committed column filter under its column and its operator", () => {
    expect(
      toContentQuery({
        path: ["2"],
        ...UNSORTED,
        query: "vision",
        filters: [
          { key: "title", op: "contains", value: "about" },
          { key: "slug", op: "starts with", value: "about" },
          { key: "updatedAt", op: "on or after", value: "2026-10-01" },
        ],
      }),
    ).toEqual({
      folder: 2,
      q: "vision",
      titleContains: "about",
      slugStartsWith: "about",
      updatedAtOnOrAfter: "2026-10-01",
    });
  });

  it("refuses an operator the schema does not name", () => {
    expect(() =>
      toContentQuery({
        path: [],
        ...UNSORTED,
        query: "",
        filters: [{ key: "title", op: "between", value: "a" }],
      }),
    ).toThrow('"between" is not an operator the schema names.');
  });
});
