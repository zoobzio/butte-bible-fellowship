import type { Hast, HastElement } from "@bbf/schema/types";
import type { Properties, RootContent } from "hast";

import { parse } from "@bbf/prose/parse";
import { reduce } from "objectively";

/** What a tree holds: an element or a run of text. */
type HastContent = Hast["children"][number];

/**
 * An element's attributes as the wire carries them. The parser's may hold
 * `undefined`, for an attribute set and then unset; the wire has no word
 * for it, and leaves the attribute out.
 */
const toProperties = (properties: Properties): HastElement["properties"] => {
  const none: HastElement["properties"] = {};
  return reduce(
    properties,
    (carried, name, value) =>
      value === undefined ? carried : { ...carried, [name]: value },
    none,
  );
};

/**
 * A node of the parser's tree as the wire carries it: an element with its
 * tag, its attributes and what it holds, or a run of text. The position the
 * parser kept goes; so does anything Markdown never builds — a doctype, a
 * comment, raw HTML — should one ever come through.
 */
const toContent = (node: RootContent): HastContent[] => {
  switch (node.type) {
    case "text":
      return [{ type: "text", value: node.value }];
    case "element":
      return [
        {
          type: "element",
          tagName: node.tagName,
          properties: toProperties(node.properties),
          children: node.children.flatMap(toContent),
        },
      ];
    default:
      return [];
  }
};

/**
 * Markdown as the API serves it: the HTML tree the app renders, read the
 * way `@bbf/prose` reads a page, built node by node into the shape
 * `@bbf/schema`'s `hast` describes. What a column that holds Markdown — a
 * bio, an event's body — becomes on the wire.
 */
export const toHast = (markdown: string): Hast => ({
  type: "root",
  children: parse(markdown).children.flatMap(toContent),
});
