import type { Hast, HastElement } from "@bbf/schema/types";
import type { Properties, RootContent } from "hast";

import { reduce } from "objectively";

export type HastContent = Hast["children"][number];

const toProperties = (properties: Properties): HastElement["properties"] => {
  const none: HastElement["properties"] = {};
  return reduce(
    properties,
    (carried, name, value) =>
      value === undefined ? carried : { ...carried, [name]: value },
    none,
  );
};

export const toContent = (node: RootContent): HastContent[] => {
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
