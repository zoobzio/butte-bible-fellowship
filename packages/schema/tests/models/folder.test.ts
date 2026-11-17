import { describe, expect, it } from "vitest";

import { folderRecord, folderRecords } from "../../src/models/folder";

const TOP = {
  id: 1,
  name: "Sermon notes",
  count: 2,
  size: 4096,
  createdAt: "2026-10-17T18:00:00.000Z",
  updatedAt: "2026-10-18T09:30:00.000Z",
};

const NESTED = {
  ...TOP,
  id: 2,
  parent: 1,
  name: "Romans",
  count: 0,
  size: 0,
};

describe("folderRecord", () => {
  it("accepts a folder at the top, and one inside another", () => {
    expect(folderRecord.parse(TOP)).toEqual(TOP);
    expect(folderRecord.parse(NESTED)).toEqual(NESTED);
  });

  it("needs an id, a name, a count, a size and its dates", () => {
    for (const key of [
      "id",
      "name",
      "count",
      "size",
      "createdAt",
      "updatedAt",
    ]) {
      const { [key]: _, ...rest } = TOP as Record<string, unknown>;
      expect(folderRecord.safeParse(rest).success, key).toBe(false);
    }
  });

  it("counts nothing below none, and holds no less", () => {
    expect(folderRecord.safeParse({ ...TOP, count: -1 }).success).toBe(false);
    expect(folderRecord.safeParse({ ...TOP, size: -1 }).success).toBe(false);
  });
});

describe("folderRecords", () => {
  it("is the folders of one level, each a record", () => {
    expect(folderRecords.parse([TOP, NESTED])).toEqual([TOP, NESTED]);
    expect(folderRecords.parse([])).toEqual([]);
    expect(folderRecords.safeParse([{ id: 1 }]).success).toBe(false);
  });
});
