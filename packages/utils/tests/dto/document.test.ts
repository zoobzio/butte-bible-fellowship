import { describe, expect, it } from "vitest";

import { toDocument } from "../../src/dto/document";

const heading = (tagName: string, value: string, properties = {}) => ({
  type: "element",
  tagName,
  properties,
  children: [{ type: "text", value }],
});

const BODY = {
  type: "root",
  children: [heading("h2", "Our Vision"), heading("h2", "Our Vision")],
};

describe("toDocument", () => {
  it("is the front matter it is given, over what is written, each heading with an id of its own", () => {
    const matter = { title: "About", heading: "About Us" };
    const document = toDocument(matter, BODY);
    expect(document).toMatchObject({ type: "root", data: { matter } });
    expect(document.children).toMatchObject([
      { properties: { id: "our-vision" } },
      { properties: { id: "our-vision-1" } },
    ]);
    expect(BODY.children[0]!.properties).toEqual({});
  });

  it("is an empty document for a body left null", () => {
    expect(toDocument({ title: "Home" }, null)).toEqual({
      type: "root",
      data: { matter: { title: "Home" } },
      children: [],
    });
  });

  it("refuses a body that is not a tree", () => {
    expect(() => toDocument({ title: "Home" }, "# Hello")).toThrow();
  });
});
