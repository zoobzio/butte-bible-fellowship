import type { Element, ElementContent, Root } from "hast";

/**
 * A page as `@bbf/prose` builds it and the prosary module serves it: the
 * tree of its body, with its front matter on the root.
 */
export const document = (
  matter: Record<string, unknown>,
  ...children: ElementContent[]
): Root => ({ type: "root", data: { matter }, children });

/** An element of a page's body; a string among its children is text. */
export const element = (
  tagName: string,
  properties: Element["properties"] = {},
  ...children: (ElementContent | string)[]
): Element => ({
  type: "element",
  tagName,
  properties,
  children: children.map((child) =>
    typeof child === "string" ? { type: "text", value: child } : child,
  ),
});
