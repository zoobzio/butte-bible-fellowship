import { describe, expect, it } from "vitest";

import { parse } from "../src/parse";

describe("parse", () => {
  it("builds a paragraph with inline marks", () => {
    expect(parse("Sunday is the **center** of our week.")).toMatchObject({
      type: "root",
      children: [
        {
          type: "element",
          tagName: "p",
          children: [
            { type: "text", value: "Sunday is the " },
            {
              type: "element",
              tagName: "strong",
              children: [{ type: "text", value: "center" }],
            },
            { type: "text", value: " of our week." },
          ],
        },
      ],
    });
  });

  it("reads GitHub Flavored Markdown, as the pages do", () => {
    const tree = parse("| Day | Time |\n| --- | --- |\n| Sunday | 10:00 |");
    expect(tree.children[0]).toMatchObject({ tagName: "table" });
  });

  it("gives every heading an id, as the pages do", () => {
    expect(parse("## Who we are").children[0]).toMatchObject({
      tagName: "h2",
      properties: { id: "who-we-are" },
    });
  });

  it("builds the site's blocks as marked elements, as the pages do", () => {
    expect(parse('::map-embed{src="/map"}').children[0]).toMatchObject({
      tagName: "div",
      properties: { dataDirective: "map-embed", dataSrc: "/map" },
    });
  });

  it("keeps where each node was read", () => {
    expect(parse("Hello").children[0]).toHaveProperty("position.start.line", 1);
  });

  it("builds nothing from nothing", () => {
    expect(parse("")).toMatchObject({ type: "root", children: [] });
  });
});
