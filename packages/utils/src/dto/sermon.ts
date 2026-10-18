import type { Sermon } from "@bbf/schema/types";

import { toHast } from "./hast";
import type { SermonRow } from "../types";

/**
 * A sermon as the API serves it, from a row of the sermons. A column the
 * row has null in, or a list's row has not, the sermon leaves out; the body,
 * written as Markdown, goes out as the tree the app renders. An admin row's
 * `id`, `status` and timestamps keep it, and are not what the site shows:
 * the model carries none of them.
 */
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
