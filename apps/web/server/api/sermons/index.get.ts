import { sermonsQuery } from "@bbf/schema";
import { defineEventHandler, getQuery } from "h3";

import { useSermons } from "~~/server/composables/sermons";

/** The newest sermons the site lists, as many as the query asks for. */
export default defineEventHandler((event) => {
  const { limit } = sermonsQuery.parse(getQuery(event));
  return useSermons().list(limit);
});
