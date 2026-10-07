import type { MinimarkTree } from "@nuxt/content";

import { describe, expect, it } from "vitest";

import { outline, sectionsOnScreen } from "~/utils/outline";

const body = (...value: MinimarkTree["value"]): MinimarkTree => ({
  type: "minimark",
  value,
});

describe("outline", () => {
  it("lists the page's headings in order, with their level", () => {
    expect(
      outline(
        body(
          ["h1", { id: "our-vision" }, "Our Vision"],
          ["p", {}, "Modern wisdom…"],
          ["h2", { id: "dreams" }, "Dreams"],
          ["h1", { id: "core-beliefs" }, "Core Beliefs"],
          ["h3", { id: "god-the-father" }, "God the Father"],
        ),
      ),
    ).toEqual([
      { id: "our-vision", depth: 1, text: "Our Vision" },
      { id: "dreams", depth: 2, text: "Dreams" },
      { id: "core-beliefs", depth: 1, text: "Core Beliefs" },
      { id: "god-the-father", depth: 3, text: "God the Father" },
    ]);
  });

  it("reads a heading's words through its markup", () => {
    expect(
      outline(
        body([
          "h2",
          { id: "the-church" },
          "The ",
          ["em", {}, "one"],
          " Church",
        ]),
      ),
    ).toEqual([{ id: "the-church", depth: 2, text: "The one Church" }]);
  });

  it("leaves out headings below the third level and ones with no id", () => {
    expect(
      outline(
        body(["h4", { id: "aside" }, "Aside"], ["h2", {}, "Unnamed"], "text"),
      ),
    ).toEqual([]);
  });

  it("leaves out a heading that is not the page's own", () => {
    expect(
      outline(body(["blockquote", {}, ["h2", { id: "quoted" }, "Quoted"]])),
    ).toEqual([]);
  });
});

describe("sectionsOnScreen", () => {
  const TOPS = [200, 600, 2400];

  it("lists the sections whose headings are in view", () => {
    expect(sectionsOnScreen(TOPS, 0, 800)).toEqual([0, 1]);
  });

  it("keeps a section whose heading is above the view while it runs into it", () => {
    expect(sectionsOnScreen(TOPS, 1000, 1800)).toEqual([1]);
  });

  it("runs the last section to the end of the page", () => {
    expect(sectionsOnScreen(TOPS, 9000, 9800)).toEqual([2]);
  });

  it("lists nothing above the first heading", () => {
    expect(sectionsOnScreen(TOPS, 0, 200)).toEqual([]);
  });

  it("leaves out a section that ends where the view starts", () => {
    expect(sectionsOnScreen(TOPS, 600, 1400)).toEqual([1]);
  });

  it("lists nothing for a page with no headings", () => {
    expect(sectionsOnScreen([], 0, 800)).toEqual([]);
  });
});
