import { eventsQuery } from "@bbf/schema";
import { defineEventHandler, getQuery } from "h3";

import { useEvents } from "~~/server/composables/events";

export default defineEventHandler((event) => {
  const { from } = eventsQuery.parse(getQuery(event));
  return useEvents().list(from);
});
