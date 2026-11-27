import type { Sermon, SermonDetail, SermonRecord } from "@bbf/schema/types";

import { toHast } from "./hast";
import type { SermonDetailRow, SermonRecordRow, SermonRow } from "../types";

export const toSermon = (row: SermonRow): Sermon => ({
  slug: row.slug,
  title: row.title,
  speaker: row.speaker ?? undefined,
  summary: row.summary ?? undefined,
  body: row.body == null ? undefined : toHast(row.body),
  image: row.image ?? undefined,
  video: row.video ?? undefined,
  date: row.date,
});

/**
 * A sermon as the admin lists it: its row, less what is written about it,
 * with whether it reaches the site.
 */
export const toSermonRecord = (row: SermonRecordRow): SermonRecord => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  speaker: row.speaker ?? undefined,
  summary: row.summary ?? undefined,
  image: row.image ?? undefined,
  video: row.video ?? undefined,
  date: row.date,
  status: row.status,
  createdAt: row.created_at.toISOString(),
  updatedAt: row.updated_at.toISOString(),
});

/**
 * A sermon as the admin reads it on its own page: its row whole, what is
 * written about it as the Markdown it was written in.
 */
export const toSermonDetail = (row: SermonDetailRow): SermonDetail => ({
  ...toSermonRecord(row),
  body: row.body ?? undefined,
});
