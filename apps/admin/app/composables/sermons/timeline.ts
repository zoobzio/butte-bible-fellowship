import type { SermonRecord } from "@bbf/schema/types";

import type { TimelineFetch, TimelineRefresh } from "~/types/timeline";

import { sermonBatch } from "@bbf/schema";
import { createTimeline } from "#imports";
import { useApi } from "~/composables/api";
import { ROUTE } from "~/composables/sermons/routes";
import { SERMONS_TIMELINE } from "~/constants/sermons";
import { answered } from "~/utils/listing";
import { toBatchQuery, toFetchResult } from "~/utils/sermons";

const api = useApi();

/**
 * A batch of the sermons the search finds, over the admin's API, from the
 * cursor given.
 */
const fetch: TimelineFetch<SermonRecord> = async (params) =>
  toFetchResult(
    sermonBatch.parse(await api(ROUTE, { query: toBatchQuery(params) })),
  );

/**
 * The poll of the timeline's sync: the first batch of the search, asked
 * for with the mark the sermons were last read at. The API answers nothing where they
 * still stand, and the batch as it now is where anything was added or
 * changed, which the timeline lays into the sermons it holds.
 */
const refresh: TimelineRefresh<SermonRecord> = async ({ since, ...params }) => {
  const data = await api(ROUTE, {
    query: { ...toBatchQuery(params), since },
  });
  return answered(data) ? toFetchResult(sermonBatch.parse(data)) : null;
};

/**
 * The sermons timeline: the config of the constants over the admin's API.
 * Each change to the search asks the API for the first batch of what it
 * finds. It reads a batch at a time and writes nothing itself: a sync and a
 * sermon's status are the sermons page's to carry out.
 */
export const useSermonsTimeline = createTimeline<SermonRecord>("sermons", {
  ...SERMONS_TIMELINE,
  fetch,
  refresh,
});
