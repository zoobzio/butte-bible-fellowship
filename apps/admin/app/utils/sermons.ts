import type { SermonBatch, SermonRecord } from "@bbf/schema/types";

import type { TimelineFetch, TimelineFetchResult } from "~/types/timeline";

import { toFilterQuery } from "~/utils/listing";

/**
 * What the timeline asks the API for: how many sermons, the cursor of the
 * batch before once there is one, the free text as `q`, and one field
 * filter per key, named as a table's are.
 */
export const toBatchQuery = ({
  cursor,
  limit,
  query,
  filters,
}: Parameters<TimelineFetch<SermonRecord>>[0]): Record<
  string,
  string | number
> => ({
  ...toFilterQuery(filters),
  limit,
  ...(cursor === null ? {} : { cursor }),
  ...(query === "" ? {} : { q: query }),
});

/**
 * A batch of the sermons as the timeline takes it: its records, the cursor
 * of the batch after it, and the mark it was read at.
 */
export const toFetchResult = (
  batch: SermonBatch,
): TimelineFetchResult<SermonRecord> => ({
  data: batch.items,
  cursor: batch.cursor,
  ...(batch.since === undefined ? {} : { since: batch.since }),
});

/**
 * The day a sermon was preached, as the locale writes a day. It is a
 * calendar day, read in UTC so that no time zone moves it.
 */
export const toPreached = (date: string, locale: string): string =>
  new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
