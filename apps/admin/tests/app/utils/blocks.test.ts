import { describe, expect, it } from "vitest";

import { EditorService, createEditorState, html } from "@zoobzio/editor";
import { BLOCK_MARKER, Block } from "~/utils/blocks";

/** The document as an editor with the site's blocks hands it back. */
const through = (source: string, extensions = [Block]) => {
  const editor = new EditorService<string, string>(
    "blocks",
    {},
    createEditorState(),
    { ...html, extensions },
  );
  editor.load(source);
  return editor.document;
};

const CARDS =
  '<div data-directive="invite-grid">' +
  '<div data-directive="invite-card"><h3>New to Chico?</h3><p>Join us.</p></div>' +
  '<div data-directive="invite-card"><p>You’re <strong>invited</strong>.</p></div>' +
  "</div>";

const MAP =
  '<div data-directive="map-embed" data-src="https://maps.example.com/?q=a&amp;z=13" data-title="Map to the church"></div>';

describe("Block", () => {
  it("marks a block as the site's build does", () => {
    expect(BLOCK_MARKER).toBe("data-directive");
  });

  it("keeps a block, the blocks in it and what is written in each", () => {
    // After a closing block the editor keeps an empty paragraph, for the
    // cursor to land in: what is saved of a page leaves it out.
    expect(through(CARDS)).toBe(`${CARDS}<p></p>`);
    expect(through(`${CARDS}<p>After.</p>`)).toBe(`${CARDS}<p>After.</p>`);
  });

  it("keeps a block nothing is written in, with every attribute it carries", () => {
    expect(through(`<p>Find us.</p>${MAP}<p>See you there.</p>`)).toBe(
      `<p>Find us.</p>${MAP}<p>See you there.</p>`,
    );
  });

  it("is what keeps them: an editor without it keeps the text and loses the block", () => {
    const bare = through(CARDS, []);
    expect(bare).not.toContain("data-directive");
    expect(bare).toContain("<h3>New to Chico?</h3>");
  });

  it("leaves a plain div, which marks nothing, to the editor", () => {
    expect(through("<div><p>Plain.</p></div>")).toBe("<p>Plain.</p>");
  });
});
