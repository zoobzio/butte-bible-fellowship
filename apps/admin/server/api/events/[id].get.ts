import { eventId } from "@bbf/schema";
import { createError, defineEventHandler, getValidatedRouterParams } from "h3";

import { useEvents } from "~~/server/composables/events";

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, eventId.parse);
  const record = await useEvents().fetch(id);
  if (record === null) {
    throw createError({ statusCode: 404, message: "Event not found" });
  }
  return record;
});
