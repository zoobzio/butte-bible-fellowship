import type { AboutRecord } from "@bbf/schema/types";

import { hast } from "@bbf/schema";

import type { AboutRecordRow, AboutRow } from "../types";
import type { ContentDocument } from "./document";

import { toDocument } from "./document";

export const toAboutRecord = (row: AboutRecordRow): AboutRecord => ({
  title: row.title,
  description: row.description ?? undefined,
  body: row.body === null ? undefined : hast.parse(row.body),
  updatedAt: row.updated_at.toISOString(),
});

/**
 * About Us as the site reads it: the title and the description it opens
 * with as its front matter, over what is written on it.
 */
export const toAboutDocument = (row: AboutRow): ContentDocument =>
  toDocument(
    { title: row.title, description: row.description ?? undefined },
    row.body,
  );
