import { eventPath } from "@bbf/schema";
import { createError, defineEventHandler, getRouterParams } from "h3";

import { useEvents } from "~~/server/composables/events";

/** One event, by slug, with what is written about it. A slug no published event has is 404. */
export default defineEventHandler(async (event) => {
  const { slug } = eventPath.parse(getRouterParams(event));
  const found = await useEvents().fetch(slug);
  if (found === null) {
    throw createError({ statusCode: 404, message: "Event not found" });
  }
  return found;
});
