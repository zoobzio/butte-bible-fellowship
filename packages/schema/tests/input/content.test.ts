import { describe, expect, it } from "vitest";

import {
  CONTENT_SORT_KEYS,
  contentArticle,
  contentBody,
  contentEntry,
  contentForm,
  contentMove,
  contentPatch,
  contentPath,
  contentQuery,
} from "../../src/input/content";

const PAGE = { slug: "about-us", title: "About Us" };

const ARTICLE = {
  type: "root",
  children: [
    {
      type: "element",
      tagName: "p",
      properties: {},
      children: [{ type: "text", value: "Our vision." }],
    },
  ],
};

const form = (value: unknown) =>
  contentForm
    .safeParse(value)
    .error?.issues.map((issue) => issue.path.join(".")) ?? [];

describe("contentPath", () => {
  it("names a page by its slug", () => {
    expect(contentPath.parse({ slug: "about-us" })).toEqual({
      slug: "about-us",
    });
    expect(contentPath.parse({ slug: "index" })).toEqual({
      slug: "index",
    });
  });

  it("rejects a slug that would not do in an address", () => {
    expect(contentPath.safeParse({ slug: "About Us" }).success).toBe(false);
    expect(contentPath.safeParse({ slug: "events/extra" }).success).toBe(false);
    expect(contentPath.safeParse({}).success).toBe(false);
  });
});

describe("contentBody", () => {
  it("writes a page with a slug and a title alone", () => {
    expect(contentBody.parse(PAGE)).toEqual(PAGE);
  });

  it("accepts all a page's metadata can say", () => {
    const page = { ...PAGE, description: "Who we are." };
    expect(contentBody.parse(page)).toEqual(page);
  });

  it("carries nothing of what is written on the page: that is written on its own", () => {
    expect(contentBody.parse({ ...PAGE, body: ARTICLE })).toEqual(PAGE);
  });

  it("carries no hero: that is the home page's, which is no content", () => {
    expect(
      contentBody.parse({ ...PAGE, hero: { tagline: "Welcome" } }),
    ).toEqual(PAGE);
  });

  it("needs a slug and a title", () => {
    expect(contentBody.safeParse({ title: "About Us" }).success).toBe(false);
    expect(contentBody.safeParse({ slug: "about-us" }).success).toBe(false);
    expect(contentBody.safeParse({ ...PAGE, title: "" }).success).toBe(false);
  });
});

describe("contentQuery", () => {
  it("names no folder: the path it is asked of does", () => {
    expect(contentQuery.parse({})).toEqual({});
    expect(contentQuery.parse({ folder: "4" })).toEqual({});
  });

  it("searches the folder for a text, trimmed, and is no page of a listing: it carries neither a page nor a size", () => {
    expect(contentQuery.parse({ page: "2", q: " vision ", size: "5" })).toEqual(
      { q: "vision" },
    );
    expect(contentQuery.parse({ q: "" })).toEqual({ q: "" });
  });

  it("filters on the title and the slug by every text operator, and on the day last changed each way", () => {
    expect(
      contentQuery.parse({
        titleContains: "beliefs",
        titleNot: "Welcome",
        slugStartsWith: "core",
        slugEndsWith: "beliefs",
        updatedAtOnOrAfter: "2026-10-01",
        updatedAtBefore: "2026-11-01",
      }),
    ).toEqual({
      titleContains: "beliefs",
      titleNot: "Welcome",
      slugStartsWith: "core",
      slugEndsWith: "beliefs",
      updatedAtOnOrAfter: "2026-10-01",
      updatedAtBefore: "2026-11-01",
    });
    expect(contentQuery.safeParse({ titleContains: "" }).success).toBe(false);
    expect(contentQuery.safeParse({ updatedAtOn: "October" }).success).toBe(
      false,
    );
    // A column the browser does not show is filtered by nothing.
    expect(contentQuery.parse({ descriptionContains: "church" })).toEqual({});
    expect(contentQuery.parse({ createdAtOn: "2026-10-01" })).toEqual({});
  });

  it("filters on the media type as on any text: every image, by what it starts with", () => {
    expect(contentQuery.parse({ mimeStartsWith: "image/" })).toEqual({
      mimeStartsWith: "image/",
    });
    expect(
      contentQuery.parse({ mimeIs: "application/pdf", mimeNotContains: "vnd" }),
    ).toEqual({ mimeIs: "application/pdf", mimeNotContains: "vnd" });
    expect(contentQuery.safeParse({ mimeIs: "" }).success).toBe(false);
    // A size is sorted by, and filtered by nothing.
    expect(contentQuery.parse({ sizeIs: "0" })).toEqual({});
  });

  it("sorts by a column of the record, either way", () => {
    for (const sort of CONTENT_SORT_KEYS) {
      expect(contentQuery.parse({ sort })).toMatchObject({ sort });
    }
    expect(CONTENT_SORT_KEYS).toEqual([
      "title",
      "slug",
      "mime",
      "size",
      "createdAt",
      "updatedAt",
    ]);
    expect(
      contentQuery.parse({ sort: "title", direction: "desc" }),
    ).toMatchObject({ sort: "title", direction: "desc" });
    expect(contentQuery.safeParse({ sort: "description" }).success).toBe(false);
    expect(contentQuery.safeParse({ direction: "down" }).success).toBe(false);
  });
});

describe("contentEntry", () => {
  it("is a new document, by its metadata", () => {
    const entry = { kind: "document", ...PAGE, description: "Who we are." };
    expect(contentEntry.parse(entry)).toEqual(entry);
    expect(contentEntry.parse({ kind: "document", ...PAGE })).toEqual({
      kind: "document",
      ...PAGE,
    });
    expect(
      contentEntry.safeParse({ kind: "document", slug: "x" }).success,
    ).toBe(false);
    expect(
      contentEntry.safeParse({ kind: "document", ...PAGE, slug: "About Us" })
        .success,
    ).toBe(false);
  });

  it("is a new folder, by its name, trimmed, which is one step of a path", () => {
    expect(contentEntry.parse({ kind: "folder", name: " News " })).toEqual({
      kind: "folder",
      name: "News",
    });
    expect(contentEntry.safeParse({ kind: "folder" }).success).toBe(false);
    expect(
      contentEntry.safeParse({ kind: "folder", name: "a/b" }).success,
    ).toBe(false);
  });

  it("says which it is, and names no folder it is made in: its path does", () => {
    expect(contentEntry.safeParse(PAGE).success).toBe(false);
    expect(contentEntry.safeParse({ name: "News" }).success).toBe(false);
    expect(contentEntry.safeParse({ kind: "image", ...PAGE }).success).toBe(
      false,
    );
    expect(
      contentEntry.parse({ kind: "document", ...PAGE, folder: 4 }),
    ).toEqual({ kind: "document", ...PAGE });
    expect(contentBody.parse({ ...PAGE, folder: 4 })).toEqual(PAGE);
  });
});

describe("contentMove", () => {
  it("names the folder something is moved into by its path, the top by none", () => {
    expect(contentMove.parse({ parent: ["Sermon notes", "Romans"] })).toEqual({
      parent: ["Sermon notes", "Romans"],
    });
    expect(contentMove.parse({ parent: [] })).toEqual({ parent: [] });
  });

  it("needs a path, each name of it a step", () => {
    expect(contentMove.safeParse({}).success).toBe(false);
    expect(contentMove.safeParse({ parent: "Romans" }).success).toBe(false);
    expect(contentMove.safeParse({ parent: [4] }).success).toBe(false);
    for (const step of ["", "a/b", ".", ".."]) {
      expect(contentMove.safeParse({ parent: [step] }).success, step).toBe(
        false,
      );
    }
  });
});

describe("contentPatch", () => {
  it("is a move, where it names a folder to move into", () => {
    expect(contentPatch.parse({ parent: ["Romans"] })).toEqual({
      parent: ["Romans"],
    });
    expect(contentPatch.parse({ parent: [] })).toEqual({ parent: [] });
  });

  it("is what is written on a document otherwise, or nothing at all, for one left without", () => {
    expect(contentPatch.parse({ body: ARTICLE })).toEqual({ body: ARTICLE });
    expect(contentPatch.parse({})).toEqual({});
  });

  it("is refused where it is neither: what it does not know is no article", () => {
    expect(contentPatch.safeParse({ folder: 4 }).success).toBe(false);
    expect(contentPatch.safeParse({ body: ARTICLE, title: "x" }).success).toBe(
      false,
    );
    expect(contentPatch.safeParse({ parent: "Romans" }).success).toBe(false);
    expect(contentPatch.safeParse({ parent: ["a/b"] }).success).toBe(false);
    expect(contentPatch.safeParse({ body: "# Our vision" }).success).toBe(
      false,
    );
  });
});

describe("contentForm", () => {
  const FILLED = { ...PAGE, description: "Who we are." };

  it("is a page's metadata as a form holds it: its slug, its title and its description", () => {
    expect(contentForm.parse(PAGE)).toEqual(PAGE);
    expect(contentForm.parse(FILLED)).toEqual(FILLED);
    expect(Object.keys(contentForm.shape)).toEqual([
      "slug",
      "title",
      "description",
    ]);
  });

  it("trims the title, and needs one left", () => {
    expect(contentForm.parse({ ...PAGE, title: "  About Us " }).title).toBe(
      "About Us",
    );
    expect(form({ ...PAGE, title: "   " })).toEqual(["title"]);
  });

  it("checks a field on its own, as a form does as it is left", () => {
    expect(contentForm.shape.slug.safeParse("About Us").success).toBe(false);
    expect(contentForm.shape.slug.safeParse("about-us").success).toBe(true);
    expect(contentForm.shape.title.safeParse(undefined).success).toBe(false);
    expect(contentForm.shape.description.safeParse(undefined).success).toBe(
      true,
    );
  });
});

describe("contentArticle", () => {
  it("takes what is written on a page as a tree, never as a string", () => {
    expect(contentArticle.parse({ body: ARTICLE })).toEqual({ body: ARTICLE });
    expect(contentArticle.safeParse({ body: "# Our vision" }).success).toBe(
      false,
    );
  });

  it("takes nothing at all, for a page left without", () => {
    expect(contentArticle.parse({})).toEqual({});
  });
});
