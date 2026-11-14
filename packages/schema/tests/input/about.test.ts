import { describe, expect, it } from "vitest";

import { aboutArticle, aboutBody, aboutForm } from "../../src/input/about";

const ABOUT = { title: "About Us" };

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
  aboutForm
    .safeParse(value)
    .error?.issues.map((issue) => issue.path.join(".")) ?? [];

describe("aboutBody", () => {
  it("writes the page's metadata with a title alone, or with its description", () => {
    expect(aboutBody.parse(ABOUT)).toEqual(ABOUT);
    const page = { ...ABOUT, description: "A clean canvas." };
    expect(aboutBody.parse(page)).toEqual(page);
  });

  it("needs a title that says something", () => {
    expect(aboutBody.safeParse({}).success).toBe(false);
    expect(aboutBody.safeParse({ title: "" }).success).toBe(false);
  });

  it("carries neither what is written on the page nor a heading apart from its title", () => {
    expect(
      aboutBody.parse({ ...ABOUT, body: ARTICLE, heading: "Us", intro: "Hi" }),
    ).toEqual(ABOUT);
  });
});

describe("aboutForm", () => {
  it("holds what the body takes, its title trimmed", () => {
    expect(aboutForm.parse({ title: "  About Us  " })).toEqual(ABOUT);
  });

  it("names a title left blank, or holding only spaces", () => {
    expect(form({})).toEqual(["title"]);
    expect(form({ title: "  " })).toEqual(["title"]);
  });

  it("keeps the description as typed", () => {
    const page = { ...ABOUT, description: " A clean canvas. " };
    expect(aboutForm.parse(page)).toEqual(page);
  });
});

describe("aboutArticle", () => {
  it("is what is written on the page, as a tree, or nothing", () => {
    expect(aboutArticle.parse({ body: ARTICLE })).toEqual({ body: ARTICLE });
    expect(aboutArticle.parse({})).toEqual({});
  });

  it("rejects what is not a tree, and carries no metadata", () => {
    expect(aboutArticle.safeParse({ body: "# Vision" }).success).toBe(false);
    expect(aboutArticle.parse({ body: ARTICLE, title: "About" })).toEqual({
      body: ARTICLE,
    });
  });
});
