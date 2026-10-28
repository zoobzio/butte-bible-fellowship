import type { Element, ElementContent, Root } from "hast";

export const document = (
  matter: Record<string, unknown>,
  ...children: ElementContent[]
): Root => ({ type: "root", data: { matter }, children });

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
