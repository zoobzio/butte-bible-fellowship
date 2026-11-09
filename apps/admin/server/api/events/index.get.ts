import { eventQuery } from "@bbf/schema";
import { defineEventHandler, getValidatedQuery } from "h3";

import { useEvents } from "~~/server/composables/events";

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, eventQuery.parse);
  return useEvents().list(query);
});
