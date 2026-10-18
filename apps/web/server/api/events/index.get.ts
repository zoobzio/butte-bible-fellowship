import { eventsQuery } from "@bbf/schema";
import { defineEventHandler, getQuery } from "h3";

import { useEvents } from "~~/server/composables/events";

/**
 * The events the site lists: the repeating ones, then the one-offs on or
 * after the date the query names — today at the church when it names none.
 */
export default defineEventHandler((event) => {
  const { from } = eventsQuery.parse(getQuery(event));
  return useEvents().list(from);
});
