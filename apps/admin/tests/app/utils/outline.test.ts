// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";

import { EditorService, createEditorState, html } from "@zoobzio/editor";
import { Block } from "~/utils/blocks";
import { Outline, anchor, headings, outline } from "~/utils/outline";

const editorOf = (source: string) => {
  const editor = new EditorService<string, string>(
    "outline",
    {},
    createEditorState(),
    { ...html, extensions: [Block, Outline] },
  );
  editor.load(source);
  return editor;
};

const PAGE =
  "<h1>Our Vision</h1><p>Modern wisdom…</p>" +
  "<h2>Dreams</h2>" +
  "<h1>Core <em>Beliefs</em></h1>" +
  "<h3>God the Father</h3><p>Amen.</p>";

describe("outline", () => {
  it("lists the document's headings in order, each with its level and the id of its words", () => {
    expect(outline(editorOf(PAGE).json)).toEqual([
      { id: "our-vision", depth: 1, text: "Our Vision" },
      { id: "dreams", depth: 2, text: "Dreams" },
      { id: "core-beliefs", depth: 1, text: "Core Beliefs" },
      { id: "god-the-father", depth: 3, text: "God the Father" },
    ]);
  });

  it("numbers the id of a heading that says what one before it did", () => {
    expect(
      outline(editorOf("<h2>Dreams</h2><h2>Dreams</h2>").json).map(
        ({ id }) => id,
      ),
    ).toEqual(["dreams", "dreams-1"]);
  });

  it("leaves out headings below the third level and ones nothing is written in", () => {
    expect(outline(editorOf("<h4>Aside</h4><h2></h2>").json)).toEqual([]);
  });

  it("leaves out a heading that is not the document's own, which still takes its id", () => {
    const { json } = editorOf(
      "<blockquote><h2>Dreams</h2></blockquote>" +
        '<div data-directive="invite-card"><h3>Dreams</h3></div>' +
        "<h2>Dreams</h2>",
    );
    expect(outline(json)).toEqual([
      { id: "dreams-2", depth: 2, text: "Dreams" },
    ]);
    expect(headings(json).map(({ id, own }) => ({ id, own }))).toEqual([
      { id: "dreams", own: false },
      { id: "dreams-1", own: false },
      { id: "dreams-2", own: true },
    ]);
  });
});

describe("anchor", () => {
  it("gives the headings under an element their ids, in order", () => {
    const editor = editorOf(PAGE);
    const page = document.createElement("div");
    page.innerHTML = editor.document;
    anchor(page, editor.json);
    expect(
      Array.from(page.querySelectorAll("h1, h2, h3"), ({ id }) => id),
    ).toEqual(["our-vision", "dreams", "core-beliefs", "god-the-father"]);
  });

  it("takes the id off a heading nothing is written in", () => {
    const editor = editorOf("<h2></h2>");
    const page = document.createElement("div");
    page.innerHTML = '<h2 id="dreams"></h2>';
    anchor(page, editor.json);
    expect(page.querySelector("h2")!.hasAttribute("id")).toBe(false);
  });
});

describe("Outline", () => {
  const mounted = (source: string) => {
    const editor = editorOf(source);
    const page = document.createElement("div");
    document.body.append(page);
    editor.mount(page);
    return { editor, page };
  };

  const ids = (page: HTMLElement) =>
    Array.from(page.querySelectorAll("h1, h2, h3"), ({ id }) => id);

  it("draws each heading in the editor with its id", () => {
    const { page } = mounted(PAGE);
    expect(ids(page)).toEqual([
      "our-vision",
      "dreams",
      "core-beliefs",
      "god-the-father",
    ]);
  });

  it("moves a heading's id along with what is written in it", () => {
    const { editor, page } = mounted("<h2>Dreams</h2><p>Text.</p>");
    editor.run((chain) =>
      chain.setTextSelection({ from: 1, to: 7 }).insertContent("Our Hopes"),
    );
    expect(ids(page)).toEqual(["our-hopes"]);
    expect(outline(editor.json)).toEqual([
      { id: "our-hopes", depth: 2, text: "Our Hopes" },
    ]);
  });

  it("writes no id into the document", () => {
    const { editor } = mounted(PAGE);
    expect(editor.document).toBe(PAGE);
  });
});
