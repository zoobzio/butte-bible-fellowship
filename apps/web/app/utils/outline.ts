import type { Root, RootContent } from "hast";

import type { OutlineEntry } from "~/types/outline";

/** The headings an outline lists, by tag, with their level. */
const DEPTHS: Record<string, number> = { h1: 1, h2: 2, h3: 3 };

/** A node's words, without the markup around them. */
const text = (node: RootContent): string => {
  if (node.type === "text") return node.value;
  if (node.type === "element") return node.children.map(text).join("");
  return "";
};

/**
 * A page's outline: its headings, in the order it sets them, read from the
 * page's own body. A page here opens each of its parts with an `h1`, so the
 * outline starts there. Only a heading the page sets at its top level
 * counts — not one inside a quote or a component — and only one with an
 * id, since that is what a link names; the build gives every heading one.
 */
export const outline = (body: Root): OutlineEntry[] => {
  return body.children.flatMap((node) => {
    if (node.type !== "element") return [];
    const depth = DEPTHS[node.tagName];
    const id = node.properties.id;
    if (depth === undefined || typeof id !== "string") return [];
    return [{ id, depth, text: text(node) }];
  });
};

/**
 * The sections on screen, by index, from where each one's heading sits: a
 * section runs from its heading to the next one, and the last to the end of
 * the page. `tops` are the headings' offsets in order, and `top` and
 * `bottom` the edges of what can be seen, all from the same origin. A
 * section is on screen while any of it is — its heading, or what it heads.
 */
export const sectionsOnScreen = (
  tops: number[],
  top: number,
  bottom: number,
): number[] => {
  return tops.flatMap((start, index) => {
    const end = tops[index + 1] ?? Infinity;
    return start < bottom && end > top ? [index] : [];
  });
};
