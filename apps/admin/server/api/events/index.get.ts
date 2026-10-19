import { listingQuery } from "@bbf/schema";
import { defineEventHandler, getValidatedQuery } from "h3";

import { useEvents } from "~~/server/composables/events";

/** One page of the events, whatever their status: the repeating ones first, then the one-offs by date. A query that is not one is 400. */
export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, listingQuery.parse);
  return useEvents().list(query);
});
