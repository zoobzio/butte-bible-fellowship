/** A heading of a page, as its table of contents lists it. */
export interface OutlineEntry {
  /** The heading's id: the anchor a link to it names. */
  id: string;
  /** The heading's level: 1 for an `h1`. */
  depth: number;
  text: string;
}
