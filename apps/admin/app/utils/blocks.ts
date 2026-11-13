import { Node } from "@tiptap/core";

/**
 * The attribute that marks one of the site's blocks, and names it: an
 * `invite-card`, a `map-embed`. The site renders each with the component
 * of that name.
 */
export const BLOCK_MARKER = "data-directive";

/**
 * One of the site's blocks, in the editor: a `div` the marker names, kept
 * as it is with every attribute it carries, around whatever is written in
 * it, other blocks among it. The editor's own nodes model none of them, and
 * an element nothing models keeps its text and loses itself, so without
 * this a page saved would lose its cards and its map.
 */
export const Block = Node.create({
  name: "directive",
  group: "block",
  content: "block*",
  defining: true,

  addAttributes() {
    return {
      attributes: {
        default: {},
        parseHTML: (element) =>
          Object.fromEntries(
            Array.from(element.attributes, ({ name, value }) => [name, value]),
          ),
        renderHTML: ({ attributes }) => attributes as Record<string, string>,
      },
    };
  },

  parseHTML() {
    return [{ tag: `div[${BLOCK_MARKER}]` }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", HTMLAttributes, 0];
  },
});
