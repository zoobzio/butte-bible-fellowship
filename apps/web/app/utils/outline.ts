import type { Root, RootContent } from "hast";

import type { OutlineEntry } from "~/types/outline";

const DEPTHS: Record<string, number> = { h1: 1, h2: 2, h3: 3 };

const text = (node: RootContent): string => {
  if (node.type === "text") return node.value;
  if (node.type === "element") return node.children.map(text).join("");
  return "";
};

export const outline = (body: Root): OutlineEntry[] => {
  return body.children.flatMap((node) => {
    if (node.type !== "element") return [];
    const depth = DEPTHS[node.tagName];
    const id = node.properties.id;
    if (depth === undefined || typeof id !== "string") return [];
    return [{ id, depth, text: text(node) }];
  });
};

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
