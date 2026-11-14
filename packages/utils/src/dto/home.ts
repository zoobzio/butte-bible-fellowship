import type { HomePage, HomeRecord } from "@bbf/schema/types";

import { hast } from "@bbf/schema";

import type { HomeRecordRow, HomeRow } from "../types";
import type { ContentDocument } from "./document";

import { toDocument } from "./document";

export const toHomeRecord = (row: HomeRecordRow): HomeRecord => ({
  title: row.title,
  description: row.description ?? undefined,
  heroHeading: row.hero_heading,
  heroDescription: row.hero_description,
  heroAction: row.hero_action,
  heroLink: row.hero_link,
  heroImage: row.hero_image ?? undefined,
  body: row.body === null ? undefined : hast.parse(row.body),
  updatedAt: row.updated_at.toISOString(),
});

/**
 * The home page as the site reads it: its title, its description and the
 * hero it opens with as its front matter, over what is written on it.
 */
export const toHomeDocument = (row: HomeRow): ContentDocument<HomePage> =>
  toDocument(
    {
      title: row.title,
      description: row.description ?? undefined,
      hero: {
        heading: row.hero_heading,
        description: row.hero_description,
        action: row.hero_action,
        link: row.hero_link,
        image: row.hero_image ?? undefined,
      },
    },
    row.body,
  );
