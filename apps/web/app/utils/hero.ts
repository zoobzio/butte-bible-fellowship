import type { HeadingPart } from "~/types/hero";

/** What marks the highlight in a heading: a pair of asterisks either side. */
const HIGHLIGHT = /\*\*(.+?)\*\*/;

/**
 * A heading as the parts it is drawn in: its words in order, each run
 * that stood between two pairs of asterisks marked as a highlight, the
 * asterisks gone. A heading with none is one part.
 */
export const headingParts = (heading: string): HeadingPart[] =>
  heading
    .split(HIGHLIGHT)
    .map((text, index) => ({ text, highlight: index % 2 === 1 }))
    .filter((part) => part.text !== "");
