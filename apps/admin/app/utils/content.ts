import type { Hast, HastElement } from "@bbf/schema/types";

type Node = Hast["children"][number];

/** A paragraph nothing is written in. */
const isBlank = (node: Node | undefined): boolean =>
  node?.type === "element" &&
  node.tagName === "p" &&
  node.children.length === 0;

/**
 * A link as it was written: the editor marks every link to open in a tab
 * of its own, which no page of the site asked for.
 */
const toLink = ({ properties, ...link }: HastElement): HastElement => {
  const { target: _target, rel: _rel, ...written } = properties;
  return { ...link, properties: written };
};

const toWritten = (node: Node): Node => {
  if (node.type !== "element") return node;
  const element = node.tagName === "a" ? toLink(node) : node;
  return { ...element, children: element.children.map(toWritten) };
};

/**
 * What is written on a page as the site is to render it, of what the
 * editor hands over: its links as they were written, and without the empty
 * paragraphs the editor keeps after a closing block for the cursor to
 * land in.
 */
export const toPageBody = (tree: Hast): Hast => {
  const children = tree.children.map(toWritten);
  while (isBlank(children.at(-1))) children.pop();
  return { type: "root", children };
};
