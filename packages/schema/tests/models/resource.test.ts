import { describe, expect, it } from "vitest";

import { contentResource } from "../../src/models/resource";

const FOLDER = {
  id: 1,
  name: "Sermon notes",
  count: 2,
  size: 4096,
  createdAt: "2026-10-17T18:00:00.000Z",
  updatedAt: "2026-10-18T09:30:00.000Z",
};

const INSIDE = { ...FOLDER, id: 2, parent: 1, name: "Romans", count: 0 };

const DOCUMENT = {
  id: 5,
  folder: 1,
  mime: "application/vnd.bbf.article+json",
  slug: "welcome",
  title: "Welcome",
  size: 0,
  createdAt: "2026-10-17T18:00:00.000Z",
  updatedAt: "2026-10-18T09:30:00.000Z",
};

describe("contentResource", () => {
  it("is a folder, with the folders inside it and the documents filed in it", () => {
    const resource = {
      kind: "folder",
      folder: FOLDER,
      folders: [INSIDE],
      files: [DOCUMENT],
    };
    expect(contentResource.parse(resource)).toEqual(resource);
  });

  it("is the top, a folder that is none itself, and may hold nothing", () => {
    const top = { kind: "folder", folders: [], files: [] };
    expect(contentResource.parse(top)).toEqual(top);
  });

  it("needs of a folder what it holds, each a record", () => {
    expect(contentResource.safeParse({ kind: "folder" }).success).toBe(false);
    expect(
      contentResource.safeParse({ kind: "folder", folders: [] }).success,
    ).toBe(false);
    expect(
      contentResource.safeParse({
        kind: "folder",
        folders: [{ id: 1 }],
        files: [],
      }).success,
    ).toBe(false);
    expect(
      contentResource.safeParse({
        kind: "folder",
        folder: { id: 1 },
        folders: [],
        files: [],
      }).success,
    ).toBe(false);
  });

  it("is a document, by its record", () => {
    const resource = { kind: "document", record: DOCUMENT };
    expect(contentResource.parse(resource)).toEqual(resource);
    expect(contentResource.safeParse({ kind: "document" }).success).toBe(false);
    expect(
      contentResource.safeParse({ kind: "document", record: FOLDER }).success,
    ).toBe(false);
  });

  it("says which it is", () => {
    expect(contentResource.safeParse({ folders: [], files: [] }).success).toBe(
      false,
    );
    expect(
      contentResource.safeParse({ kind: "image", record: DOCUMENT }).success,
    ).toBe(false);
  });
});
