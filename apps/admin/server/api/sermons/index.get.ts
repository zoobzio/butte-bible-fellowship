import { sermonBatchQuery } from "@bbf/schema";
import { defineEventHandler, getValidatedQuery, setResponseStatus } from "h3";

import { useSermons } from "~~/server/composables/sermons";

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, sermonBatchQuery.parse);
  const batch = await useSermons().batch(query);
  // Asked since a mark the sermons still stand at: nothing to say.
  if (batch === null) setResponseStatus(event, 204);
  return batch;
});
