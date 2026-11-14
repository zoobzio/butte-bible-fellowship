import type { ContentRecord } from "@bbf/schema/types";

import { hast } from "@bbf/schema";

import type { ContentRecordRow, ContentRow } from "../types";
import type { ContentDocument } from "./document";

import { toDocument } from "./document";

export const toContentRecord = (row: ContentRecordRow): ContentRecord => ({
  id: row.id,
  folder: row.folder_id ?? undefined,
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
export const toContentDocument = (row: ContentRow): ContentDocument =>
  toDocument(
    { title: row.title, description: row.description ?? undefined },
    row.body,
  );
