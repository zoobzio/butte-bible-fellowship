import { describe, expect, it } from "vitest";

import { hast, hastElement, hastText } from "../../src/models/hast";

const TEXT = { type: "text", value: "Has served since 2010." };
const PARAGRAPH = {
  type: "element",
  tagName: "p",
  properties: {},
  children: [TEXT],
};

describe("hast", () => {
  it("is a root of elements and text", () => {
    const tree = { type: "root", children: [PARAGRAPH, TEXT] };
    expect(hast.parse(tree)).toEqual(tree);
    expect(hast.parse({ type: "root", children: [] })).toEqual({
      type: "root",
      children: [],
    });
  });

  it("nests elements to any depth", () => {
    const tree = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "ul",
          properties: {},
          children: [
            {
              type: "element",
              tagName: "li",
              properties: {},
              children: [
                {
                  type: "element",
                  tagName: "em",
                  properties: {},
                  children: [TEXT],
                },
              ],
            },
          ],
        },
      ],
    };
    expect(hast.parse(tree)).toEqual(tree);
  });

  it("carries an element's attributes as hast names them", () => {
    const element = {
      ...PARAGRAPH,
      tagName: "a",
      properties: {
        href: "/connect",
        className: ["link", "external"],
        dataDirective: "map-embed",
        tabIndex: 0,
        hidden: true,
        title: null,
      },
    };
    expect(hastElement.parse(element)).toEqual(element);
    expect(
      hastElement.safeParse({ ...PARAGRAPH, properties: { onclick: {} } })
        .success,
    ).toBe(false);
  });

  it("rejects what Markdown never builds, and a node's position", () => {
    for (const node of [
      { type: "doctype" },
      { type: "comment", value: "x" },
      { type: "raw", value: "<b>" },
    ]) {
      expect(hast.safeParse({ type: "root", children: [node] }).success).toBe(
        false,
      );
    }
    expect(hastText.parse({ ...TEXT, position: { start: {} } })).toEqual(TEXT);
    expect(hast.safeParse(PARAGRAPH).success).toBe(false);
  });
});
