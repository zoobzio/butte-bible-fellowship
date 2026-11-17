import { describe, expect, it } from "vitest";

import {
  CONTENT_SORT_KEYS,
  contentArticle,
  contentBody,
  contentDraft,
  contentForm,
  contentId,
  contentPath,
  contentPlacement,
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

describe("contentId", () => {
  it("names a page by its row's number, as the address writes it", () => {
    expect(contentId.parse({ id: "3" })).toEqual({ id: 3 });
    expect(contentId.safeParse({ id: "0" }).success).toBe(false);
    expect(contentId.safeParse({ id: "about-us" }).success).toBe(false);
  });
});

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
  it("lists the pages at the top, or those filed in the folder it names", () => {
    expect(contentQuery.parse({})).toEqual({});
    expect(contentQuery.parse({ folder: "4" })).toEqual({ folder: 4 });
    expect(contentQuery.safeParse({ folder: "0" }).success).toBe(false);
    expect(contentQuery.safeParse({ folder: "sermons" }).success).toBe(false);
  });

  it("searches the folder for a text, trimmed, and is no page of a listing: it carries neither a page nor a size", () => {
    expect(contentQuery.parse({ page: "2", q: " vision ", size: "5" })).toEqual(
      { q: "vision" },
    );
    expect(contentQuery.parse({ folder: "4", q: "" })).toEqual({
      folder: 4,
      q: "",
    });
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

describe("contentPlacement", () => {
  it("files a page in a folder, or at the top when it names none", () => {
    expect(contentPlacement.parse({ folder: 4 })).toEqual({ folder: 4 });
    expect(contentPlacement.parse({})).toEqual({});
    expect(contentPlacement.safeParse({ folder: 0 }).success).toBe(false);
    expect(contentPlacement.safeParse({ folder: "4" }).success).toBe(false);
  });
});

describe("contentDraft", () => {
  it("is a new page's metadata, and the folder it is made in", () => {
    expect(contentDraft.parse(PAGE)).toEqual(PAGE);
    expect(contentDraft.parse({ ...PAGE, folder: 4 })).toEqual({
      ...PAGE,
      folder: 4,
    });
    expect(contentDraft.safeParse({ folder: 4 }).success).toBe(false);
  });

  it("is where alone a folder is written with the metadata: an update leaves a page where it is", () => {
    expect(contentBody.parse({ ...PAGE, folder: 4 })).toEqual(PAGE);
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
