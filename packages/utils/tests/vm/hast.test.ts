import type { Hast } from "@bbf/schema/types";

import { hast } from "@bbf/schema";
import { describe, expect, it } from "vitest";

import { fromHtml, toHtml } from "../../src/vm/hast";

const BIO: Hast = {
  type: "root",
  children: [
    {
      type: "element",
      tagName: "h2",
      properties: { id: "jane" },
      children: [{ type: "text", value: "Jane" }],
    },
    {
      type: "element",
      tagName: "p",
      properties: {},
      children: [
        { type: "text", value: "Serving " },
        {
          type: "element",
          tagName: "strong",
          properties: {},
          children: [{ type: "text", value: "since 2010" }],
        },
        { type: "text", value: "." },
      ],
    },
  ],
};

const HTML =
  '<h2 id="jane">Jane</h2><p>Serving <strong>since 2010</strong>.</p>';

describe("toHtml", () => {
  it("writes the tree as the HTML an editor holds", () => {
    expect(toHtml(BIO)).toBe(HTML);
  });

  it("writes nothing from nothing", () => {
    expect(toHtml({ type: "root", children: [] })).toBe("");
  });
});

describe("fromHtml", () => {
  it("builds the tree the app renders, from the HTML an editor wrote", () => {
    expect(fromHtml(HTML)).toEqual(BIO);
  });

  it("reads a fragment, not a page", () => {
    expect(fromHtml("<p>x</p>").children.map((node) => node.type)).toEqual([
      "element",
    ]);
    expect(fromHtml("<p>x</p>")).not.toMatchObject({
      children: [{ tagName: "html" }],
    });
  });

  it("carries no position, at any depth", () => {
    expect(
      JSON.stringify(fromHtml("<ul><li><em>a</em></li><li>b</li></ul>")),
    ).not.toContain('"position"');
  });

  it("drops what the schema has no node for", () => {
    expect(fromHtml("<!-- gone --><p>kept</p>")).toEqual({
      type: "root",
      children: [
        {
          type: "element",
          tagName: "p",
          properties: {},
          children: [{ type: "text", value: "kept" }],
        },
      ],
    });
  });

  it("builds what the schema accepts", () => {
    expect(
      hast.safeParse(
        fromHtml(
          '<h2>A</h2><ul class="x"><li><input type="checkbox" disabled>t</li></ul><a href="/connect">us</a>',
        ),
      ).success,
    ).toBe(true);
  });

  it("builds nothing from nothing", () => {
    expect(fromHtml("")).toEqual({ type: "root", children: [] });
  });

  it("round trips", () => {
    expect(fromHtml(toHtml(BIO))).toEqual(BIO);
    expect(toHtml(fromHtml(HTML))).toBe(HTML);
  });
});
