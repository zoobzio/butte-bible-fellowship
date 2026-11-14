import { folderDraft } from "@bbf/schema";
import { describe, expect, it } from "vitest";

import { toFolderArguments } from "../../src/dao/folder";

describe("toFolderArguments", () => {
  it("is a new folder's name, and the folder it is made in", () => {
    const draft = folderDraft.parse({ name: "Romans", parent: 2 });
    expect(toFolderArguments(draft)).toEqual({ name: "Romans", parent_id: 2 });
  });

  it("writes no folder as null: it is made at the top", () => {
    const draft = folderDraft.parse({ name: "News" });
    expect(toFolderArguments(draft)).toEqual({ name: "News", parent_id: null });
  });
});
