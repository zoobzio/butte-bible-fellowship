import { folderRecord } from "@bbf/schema";
import { describe, expect, it } from "vitest";

import { toFolderRecord } from "../../src/dto/folder";

const ROW = {
  id: 2,
  parent_id: 1,
  name: "Romans",
  count: 3,
  size: 4096,
  created_at: new Date("2026-10-17T18:00:00.000Z"),
  updated_at: new Date("2026-10-18T09:30:00.000Z"),
};

describe("toFolderRecord", () => {
  it("is a folder as the admin reads it: every column, its dates as text", () => {
    const record = toFolderRecord(ROW);
    expect(record).toEqual({
      id: 2,
      parent: 1,
      name: "Romans",
      count: 3,
      size: 4096,
      createdAt: "2026-10-17T18:00:00.000Z",
      updatedAt: "2026-10-18T09:30:00.000Z",
    });
    expect(folderRecord.parse(record)).toEqual(record);
  });

  it("leaves out the folder it is inside when it is at the top", () => {
    const record = toFolderRecord({ ...ROW, parent_id: null });
    expect(record.parent).toBeUndefined();
    expect(folderRecord.safeParse(record).success).toBe(true);
  });
});
