import { folderBody } from "@bbf/schema";
import { describe, expect, it } from "vitest";

import { toFolderArguments } from "../../src/dao/folder";

describe("toFolderArguments", () => {
  it("is a new folder's name, and the folder it is made in", () => {
    const body = folderBody.parse({ name: "Romans" });
    expect(toFolderArguments(body, 2)).toEqual({
      name: "Romans",
      parent_id: 2,
    });
  });

  it("writes no folder as null: it is made at the top", () => {
    const body = folderBody.parse({ name: "News" });
    expect(toFolderArguments(body)).toEqual({ name: "News", parent_id: null });
  });
});
