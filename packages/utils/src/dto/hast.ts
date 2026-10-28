import type { Hast, HastElement } from "@bbf/schema/types";
import type { Properties, RootContent } from "hast";

import { parse } from "@bbf/prose/parse";
import { reduce } from "objectively";

type HastContent = Hast["children"][number];

const toProperties = (properties: Properties): HastElement["properties"] => {
  const none: HastElement["properties"] = {};
  return reduce(
    properties,
    (carried, name, value) =>
      value === undefined ? carried : { ...carried, [name]: value },
    none,
  );
};

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

export const toHast = (markdown: string): Hast => ({
  type: "root",
  children: parse(markdown).children.flatMap(toContent),
});
