import type {
  SermonBatch,
  SermonBatchQuery,
  SermonDetail,
  SermonSync,
} from "@bbf/schema/types";

import type { FeedVideo } from "~~/server/types/feed";

import { SERMON_CURSOR } from "@bbf/schema";
import { toSermonDetail, toSermonRecord } from "@bbf/utils";
import { TIME_ZONE } from "#layers/bbf/shared/constants/time";
import { useDatabase } from "#layers/bbf/server/composables/database";

import { useChanges } from "~~/server/composables/changes";
import { toEntries } from "~~/server/utils/feed";
import { toDaySearch, toTextSearch } from "~~/server/utils/listing";

/** The text columns of a sermon, each filtered by the text operators. */
const TEXT_COLUMNS = ["title", "speaker", "summary"] as const;

/** The day column of a sermon: the day it was preached, a day as written. */
const DAY_COLUMNS = { date: "date" } as const;

/**
 * The search as the query takes it: null for each part left out. The day a
 * sermon was preached is a calendar day, so no time zone reads it.
 */
const toSearch = (query: SermonBatchQuery) => ({
  q: query.q === undefined || query.q === "" ? null : query.q,
  status_is: query.statusIs ?? null,
  status_not: query.statusNot ?? null,
  ...toTextSearch(TEXT_COLUMNS, query),
  ...toDaySearch(DAY_COLUMNS, query),
});

/**
 * Where a batch is read from, as the query takes it: the day and the id
 * the batch before ended on, or neither for the first.
 */
const toAfter = (cursor: string | undefined) => {
  const [, date, id] = SERMON_CURSOR.exec(cursor ?? "") ?? [];
  return date === undefined
    ? { after_date: null, after_id: null }
    : { after_date: date, after_id: Number(id) };
};

export const useSermons = () => {
  const db = useDatabase();
  const changes = useChanges();

  /**
   * A batch of the sermons the search finds, the latest preached first,
   * with the cursor of the batch after it, null where there is none, and
   * the mark the sermons stand at as its `since`. Asked with that mark again, and nothing added,
   * changed or removed since, nothing: what the asker holds still stands.
   * One sermon more than asked is read, to tell whether a batch follows.
   */
  const batch = async (
    query: SermonBatchQuery,
  ): Promise<SermonBatch | null> => {
    const since = await changes.mark("sermons");
    if (query.since === since) return null;
    const rows = await db.admin.sermons.batch({
      ...toAfter(query.cursor),
      ...toSearch(query),
      size: query.limit + 1,
    });
    const items = rows.slice(0, query.limit);
    const last = items.at(-1);
    return {
      items: items.map(toSermonRecord),
      cursor:
        rows.length > query.limit && last !== undefined
          ? `${last.date}.${last.id}`
          : null,
      since,
    };
  };

  /**
   * The recordings given, taken in: a sermon added for each the sermons do
   * not hold, a draft, preached the Sunday it was published on or before,
   * in the church's time zone. One held already is left as it is, so a
   * sync is safe to run again, and whatever was changed of a sermon since
   * it was added is kept.
   */
  const sync = async (videos: FeedVideo[]): Promise<SermonSync> => {
    const entries = toEntries(videos, TIME_ZONE);
    // Written out as JSON here: handed over as a list, the driver would
    // send it as a Postgres array, which the query cannot read as JSON.
    const added =
      entries.length === 0
        ? []
        : await db.admin.sermons.import({ entries: JSON.stringify(entries) });
    return { found: entries.length, added: added.length };
  };

  /**
   * A sermon whole, what is written about it among the rest, or null
   * where there is none of that id.
   */
  const fetch = async (id: number): Promise<SermonDetail | null> => {
    const row = await db.admin.sermons.fetch.first({ id });
    return row === null ? null : toSermonDetail(row);
  };

  return { batch, fetch, sync };
};
