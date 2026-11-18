import { eventWindow } from "@bbf/schema";
import { defineEventHandler, getValidatedQuery } from "h3";

import { useEvents } from "~~/server/composables/events";

/** The events held within a span of days: what the calendar lays out. */
export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, eventWindow.parse);
  return useEvents().held(query);
});
