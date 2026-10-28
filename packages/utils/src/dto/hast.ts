import type { Hast, HastElement } from "@bbf/schema/types";
import type { Properties, RootContent } from "hast";

import { definePipeline } from "@prosary/parse";
import { gfm, mdc } from "@prosary/parse/plugins";
import { reduce } from "objectively";
import rehypeSlug from "rehype-slug";

type HastContent = Hast["children"][number];

// The presets the pages are built with, less the front matter a column
// never carries: see `content.presets` in @bbf/prose's prosary.config.ts.
const pipeline = definePipeline({
  presets: [gfm(), mdc(), { rehype: [rehypeSlug] }],
});

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
  children: pipeline.build(markdown).children.flatMap(toContent),
});
