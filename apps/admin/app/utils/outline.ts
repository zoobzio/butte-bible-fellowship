import type { OutlineEntry } from "#layers/bbf/app/types/outline";
import type { JSONContent } from "@tiptap/core";
import type { Node } from "@tiptap/pm/model";

import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import GithubSlugger from "github-slugger";

/** The editor's node for a heading, of any level. */
const HEADING = "heading";

/** The deepest heading a table of contents lists, as on the site. */
const DEPTH = 3;

/** A heading of the document: its place, and the id it answers to. */
interface Heading {
  id: string;
  depth: number;
  text: string;
  /** Whether it is the document's own, and not within a quote or a block. */
  own: boolean;
}

const words = (node: JSONContent): string =>
  node.text ?? (node.content ?? []).map(words).join("");

/**
 * Every heading of a document, in order, each with the id the site gives
 * it as the page is served: its words as a slug, numbered where two
 * headings say the same. The editor's document holds no ids, so they are
 * worked out from what is written, and follow it.
 */
export const headings = (document: JSONContent): Heading[] => {
  const slugger = new GithubSlugger();
  const walk = (node: JSONContent, own: boolean): Heading[] => {
    if (node.type !== HEADING) {
      return (node.content ?? []).flatMap((child) => walk(child, false));
    }
    const text = words(node);
    const depth = Number(node.attrs?.level ?? 1);
    return [{ id: slugger.slug(text), depth, text, own }];
  };
  return (document.content ?? []).flatMap((node) => walk(node, true));
};

/**
 * The outline of a document being written, as the site's table of contents
 * lists a page's: the document's own headings, down to the third level,
 * less any with nothing written in it yet.
 */
export const outline = (document: JSONContent): OutlineEntry[] =>
  headings(document)
    .filter(({ own, depth, id }) => own && depth <= DEPTH && id !== "")
    .map(({ id, depth, text }) => ({ id, depth, text }));

const anchors = (document: Node): DecorationSet => {
  const ids = headings(document.toJSON() as JSONContent).map(({ id }) => id);
  const marks: Decoration[] = [];
  let index = 0;
  document.descendants((node, position) => {
    if (node.type.name !== HEADING) return;
    const id = ids[index++];
    if (id) {
      marks.push(Decoration.node(position, position + node.nodeSize, { id }));
    }
  });
  return DecorationSet.create(document, marks);
};

/**
 * Gives each heading in the editor its id, for a table of contents to link
 * to. The id is drawn on the heading and is no part of the document, so
 * what is saved carries none, and typing in a heading moves its id along
 * without the heading being drawn again.
 */
export const Outline = Extension.create({
  name: "outline",

  addProseMirrorPlugins() {
    const key = new PluginKey<DecorationSet>("outline");
    return [
      new Plugin({
        key,
        state: {
          init: (_, { doc }) => anchors(doc),
          apply: (transaction, held) =>
            transaction.docChanged ? anchors(transaction.doc) : held,
        },
        props: {
          decorations: (state) => key.getState(state),
        },
      }),
    ];
  },
});

/**
 * Gives the headings under an element their ids, in the document's order:
 * for the document as it is read before the editor is turned on over it,
 * which is plain HTML the extension has no hand in.
 */
export const anchor = (root: ParentNode, document: JSONContent): void => {
  const ids = headings(document).map(({ id }) => id);
  root
    .querySelectorAll<HTMLElement>("h1, h2, h3, h4, h5, h6")
    .forEach((heading, index) => {
      const id = ids[index];
      if (id) heading.id = id;
      else heading.removeAttribute("id");
    });
};
