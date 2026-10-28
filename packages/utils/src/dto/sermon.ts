import type { Sermon } from "@bbf/schema/types";

import { toHast } from "./hast";
import type { SermonRow } from "../types";

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
