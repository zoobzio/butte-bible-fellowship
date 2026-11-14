import type { Hast, Page } from "@bbf/schema/types";
import type { Root } from "hast";

import { hast } from "@bbf/schema";
import rehypeSlug from "rehype-slug";

import { toContent } from "../hast";

/**
 * A page as a content document: what is written on it, under the front
 * matter the page carries, as the build wrote a page's from Markdown. A
 * page with a layout of its own carries more than a title and a
 * description in it: whatever its layout shows.
 */
export interface ContentDocument<Matter = Page> {
  type: "root";
  data: { matter: Matter };
  children: Hast["children"];
}

const slugger = rehypeSlug();

/**
 * The tree with an id on every heading, which a page's table of contents
 * links to: the editor writes none, so each is given as the page is served,
 * as the build gave a Markdown page's.
 */
const toOutlined = (tree: Hast): Hast["children"] => {
  const outlined = structuredClone(tree) as Root;
  slugger(outlined);
  return outlined.children.flatMap(toContent);
};

/**
 * A page as the site reads it: its front matter, over what a row has
 * written on it, every heading with an id; nothing for a body left null.
 */
export const toDocument = <Matter>(
  matter: Matter,
  body: unknown,
): ContentDocument<Matter> => ({
  type: "root",
  data: { matter },
  children: body === null ? [] : toOutlined(hast.parse(body)),
});
