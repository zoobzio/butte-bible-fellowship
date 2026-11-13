import type { ContentRecord, Hast, Page } from "@bbf/schema/types";
import type { Root } from "hast";

import { hast } from "@bbf/schema";
import rehypeSlug from "rehype-slug";

import { toContent } from "../hast";
import type { ContentRecordRow, ContentRow } from "../types";

/**
 * A page as a content document: what is written on it, under the front
 * matter a page carries, as the build wrote a page's from Markdown.
 */
export interface ContentDocument {
  type: "root";
  data: { matter: Page };
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

export const toContentRecord = (row: ContentRecordRow): ContentRecord => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  description: row.description ?? undefined,
  body: row.body === null ? undefined : hast.parse(row.body),
  createdAt: row.created_at.toISOString(),
  updatedAt: row.updated_at.toISOString(),
});

/**
 * A page as the site reads it: its title and description as its front
 * matter, over what is written on it, every heading with an id.
 */
export const toContentDocument = (row: ContentRow): ContentDocument => ({
  type: "root",
  data: {
    matter: {
      title: row.title,
      description: row.description ?? undefined,
    },
  },
  children: row.body === null ? [] : toOutlined(hast.parse(row.body)),
});
