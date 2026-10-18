import type { Sermon } from "@bbf/schema/types";

import type { SermonRow } from "../types";

/**
 * A sermon as the API serves it, from a row of the sermons. The row's
 * `published_at` is a `Date`; the model's `published` is that moment as an
 * ISO 8601 timestamp, in UTC.
 */
export const toSermon = (row: SermonRow): Sermon => ({
  id: row.id,
  title: row.title,
  published: row.published_at.toISOString(),
  thumbnail: row.thumbnail,
});
