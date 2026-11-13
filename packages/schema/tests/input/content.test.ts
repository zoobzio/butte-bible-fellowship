import { describe, expect, it } from "vitest";

import {
  CONTENT_SORT_KEYS,
  contentArticle,
  contentBody,
  contentForm,
  contentId,
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

describe("contentId", () => {
  it("names a page by its row's number, as the address writes it", () => {
    expect(contentId.parse({ id: "3" })).toEqual({ id: 3 });
    expect(contentId.safeParse({ id: "0" }).success).toBe(false);
    expect(contentId.safeParse({ id: "about-us" }).success).toBe(false);
  });
});

describe("contentPath", () => {
  it("names a page by its slug, the home page by index", () => {
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

  it("carries no hero: the home page's is the interface's own", () => {
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
  it("is the listing query", () => {
    expect(contentQuery.parse({})).toEqual({ page: 1, size: 25 });
    expect(contentQuery.parse({ page: "2", q: "vision" })).toEqual({
      page: 2,
      size: 25,
      q: "vision",
    });
  });

  it("takes what each text column is or is not, carries, starts or ends with", () => {
    const filters = {
      titleContains: "about",
      titleNotContains: "events",
      titleStartsWith: "a",
      titleEndsWith: "fellowship",
      titleIs: "About Us",
      titleNot: "Events",
      slugIs: "index",
      slugStartsWith: "about",
      descriptionIs: "missing",
      descriptionNot: "present",
      descriptionContains: "pillsbury",
    };
    expect(contentQuery.parse(filters)).toEqual({
      page: 1,
      size: 25,
      ...filters,
    });
    expect(contentQuery.safeParse({ titleContains: "" }).success).toBe(false);
  });

  it("narrows by nothing a page does not carry as a column", () => {
    const parsed = contentQuery.parse({
      heroIs: "true",
      bodyContains: "vision",
      statusIs: "published",
    });
    expect(parsed).toEqual({ page: 1, size: 25 });
  });

  it("sorts by a column of the record, either way", () => {
    for (const sort of CONTENT_SORT_KEYS) {
      expect(contentQuery.parse({ sort })).toMatchObject({ sort });
    }
    expect(CONTENT_SORT_KEYS).toEqual([
      "title",
      "slug",
      "createdAt",
      "updatedAt",
    ]);
    expect(
      contentQuery.parse({ sort: "title", direction: "desc" }),
    ).toMatchObject({ sort: "title", direction: "desc" });
    expect(contentQuery.safeParse({ sort: "description" }).success).toBe(false);
    expect(contentQuery.safeParse({ direction: "down" }).success).toBe(false);
  });

  it("takes a day each page was changed or was added before, after, on, on or after or on or before, as YYYY-MM-DD", () => {
    const days = {
      updatedAtBefore: "2026-10-17",
      updatedAtAfter: "2026-10-01",
      updatedAtOn: "2026-10-10",
      createdAtOnOrAfter: "2026-01-01",
      createdAtOnOrBefore: "2026-12-31",
    };
    expect(contentQuery.parse(days)).toEqual({ page: 1, size: 25, ...days });
    expect(contentQuery.safeParse({ updatedAtOn: "10/17/2026" }).success).toBe(
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
