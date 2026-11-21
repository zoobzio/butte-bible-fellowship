import { describe, expect, it } from "vitest";

import { ABOUT, HOME, NOTES, ROMANS } from "#test/support/records";
import {
  isUnder,
  parentOf,
  samePath,
  toBrowserFolder,
  toContentQuery,
  toCrumbs,
  toListing,
  toPath,
} from "~/utils/folders";

const UNSORTED = { sortField: null, sortDirection: "asc" as const };

/* Nothing searched for: no text, and no column filtered. */
const UNSEARCHED = { query: "", filters: [] };

describe("toPath", () => {
  it("reads the path an address names, its steps in order", () => {
    expect(toPath(["Sermon notes", "Romans"])).toEqual([
      "Sermon notes",
      "Romans",
    ]);
    expect(toPath("Sermon notes")).toEqual(["Sermon notes"]);
  });

  it("is of no steps at the top, where the address holds nothing", () => {
    expect(toPath(undefined)).toEqual([]);
    expect(toPath("")).toEqual([]);
    expect(toPath([])).toEqual([]);
    expect(toPath([""])).toEqual([]);
    expect(toPath(null)).toEqual([]);
  });
});

describe("samePath", () => {
  it("holds for the same steps in the same order, and for nothing else", () => {
    expect(samePath([], [])).toBe(true);
    expect(samePath(["a", "b"], ["a", "b"])).toBe(true);
    expect(samePath(["a", "b"], ["b", "a"])).toBe(false);
    expect(samePath(["a"], ["a", "b"])).toBe(false);
    expect(samePath(["a", "b"], ["a"])).toBe(false);
  });
});

describe("isUnder", () => {
  it("holds for a path and for every path under it", () => {
    expect(isUnder(["a"], ["a"])).toBe(true);
    expect(isUnder(["a", "b", "c"], ["a"])).toBe(true);
    expect(isUnder(["a"], [])).toBe(true);
  });

  it("does not hold for a path above, or beside", () => {
    expect(isUnder([], ["a"])).toBe(false);
    expect(isUnder(["a"], ["a", "b"])).toBe(false);
    expect(isUnder(["b", "a"], ["a"])).toBe(false);
  });
});

describe("parentOf", () => {
  it("is the path above a path's last step: the top's, above one step or none", () => {
    expect(parentOf(["Sermon notes", "Romans"])).toEqual(["Sermon notes"]);
    expect(parentOf(["Sermon notes"])).toEqual([]);
    expect(parentOf([])).toEqual([]);
  });
});

describe("toBrowserFolder", () => {
  it("names a folder by its name, which is its step of the path, with what it holds", () => {
    expect(toBrowserFolder(NOTES, [])).toMatchObject({
      key: "Sermon notes",
      label: "Sermon notes",
      count: 1,
    });
    expect(toBrowserFolder(ROMANS, ["Sermon notes"])).toMatchObject({
      key: "Romans",
      label: "Romans",
      count: 0,
    });
  });

  it("shows, under the documents' columns, what all that is under it comes to: its size and when the last of it was changed", () => {
    expect(toBrowserFolder(NOTES, []).values).toEqual({
      size: 4096,
      updatedAt: "2026-10-18T09:30:00.000Z",
    });
    expect(toBrowserFolder(ROMANS, ["Sermon notes"]).values).toEqual({
      size: 0,
      updatedAt: "2026-10-17T18:00:00.000Z",
    });
  });

  it("links a folder to its own page: its path, each name encoded as a step of the address", () => {
    expect(toBrowserFolder(NOTES, []).link).toEqual({
      to: "/content/Sermon%20notes",
    });
    expect(toBrowserFolder(ROMANS, ["Sermon notes"]).link).toEqual({
      to: "/content/Sermon%20notes/Romans",
    });
    expect(
      toBrowserFolder({ ...ROMANS, name: "Q&A: one, two + three!" }, []).link,
    ).toEqual({ to: "/content/Q%26A%3A%20one%2C%20two%20%2B%20three!" });
  });
});

describe("toCrumbs", () => {
  it("spells the trail of a path off its names alone, each crumb linked to its folder's page", () => {
    expect(toCrumbs(["Sermon notes", "Romans"])).toEqual([
      {
        key: "Sermon notes",
        label: "Sermon notes",
        link: { to: "/content/Sermon%20notes" },
      },
      {
        key: "Romans",
        label: "Romans",
        link: { to: "/content/Sermon%20notes/Romans" },
      },
    ]);
  });

  it("is no crumb at the top", () => {
    expect(toCrumbs([])).toEqual([]);
  });
});

describe("toListing", () => {
  it("lists a folder's folders, each linked under the folder's path, and its documents", () => {
    expect(
      toListing(
        { kind: "folder", folder: NOTES, folders: [ROMANS], files: [ABOUT] },
        ["Sermon notes"],
      ),
    ).toEqual({
      folders: [toBrowserFolder(ROMANS, ["Sermon notes"])],
      files: [ABOUT],
    });
  });

  it("lists nothing of a document, which holds neither", () => {
    expect(toListing({ kind: "document", record: HOME }, ["index"])).toEqual({
      folders: [],
      files: [],
    });
  });
});

describe("toContentQuery", () => {
  it("asks for nothing beside the path with nothing sorted or searched for", () => {
    expect(toContentQuery({ ...UNSORTED, ...UNSEARCHED })).toEqual({});
  });

  it("carries the sort the browser holds, and its direction with it", () => {
    expect(
      toContentQuery({
        sortField: "title",
        sortDirection: "desc",
        ...UNSEARCHED,
      }),
    ).toEqual({ sort: "title", direction: "desc" });
  });

  it("carries the free text as q, and each committed column filter under its column and its operator", () => {
    expect(
      toContentQuery({
        ...UNSORTED,
        query: "vision",
        filters: [
          { key: "title", op: "contains", value: "about" },
          { key: "slug", op: "starts with", value: "about" },
          { key: "updatedAt", op: "on or after", value: "2026-10-01" },
        ],
      }),
    ).toEqual({
      q: "vision",
      titleContains: "about",
      slugStartsWith: "about",
      updatedAtOnOrAfter: "2026-10-01",
    });
  });

  it("refuses an operator the schema does not name", () => {
    expect(() =>
      toContentQuery({
        ...UNSORTED,
        query: "",
        filters: [{ key: "title", op: "between", value: "a" }],
      }),
    ).toThrow('"between" is not an operator the schema names.');
  });
});
