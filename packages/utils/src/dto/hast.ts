import type { Hast } from "@bbf/schema/types";

import { definePipeline } from "@prosary/parse";
import { gfm, mdc } from "@prosary/parse/plugins";
import rehypeSlug from "rehype-slug";

import { toContent } from "../hast";

// The presets the pages are built with, less the front matter a column
// never carries: see `content.presets` in @bbf/prose's prosary.config.ts.
const pipeline = definePipeline({
  presets: [gfm(), mdc(), { rehype: [rehypeSlug] }],
});

export const toHast = (markdown: string): Hast => ({
  type: "root",
  children: pipeline.build(markdown).children.flatMap(toContent),
});
