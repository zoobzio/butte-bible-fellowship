import type { MinimarkNode, MinimarkTree } from "@nuxt/content";

import type { OutlineEntry } from "~/types/outline";

/** The headings an outline lists, by tag, with their level. */
const DEPTHS: Record<string, number> = { h1: 1, h2: 2, h3: 3 };

/** A node's words, without the markup around them. */
const text = (node: MinimarkNode): string => {
  if (typeof node === "string") return node;
  const [, , ...children] = node;
  return children.map(text).join("");
};

/**
 * A page's outline: its headings, in the order it sets them, read from the
 * page's own body. Nuxt Content's `body.toc` starts at `h2`, and a page here
 * opens each of its parts with an `h1`, so the body is read instead. Only a
 * heading the page sets at its top level counts — not one inside a quote or
 * a component — and only one with an id, since that is what a link names.
 */
export const outline = (body: MinimarkTree): OutlineEntry[] => {
  return body.value.flatMap((node) => {
    if (typeof node === "string") return [];
    const [tag, props] = node;
    const depth = DEPTHS[tag];
    const id = props.id;
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
