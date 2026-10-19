import { eventId } from "@bbf/schema";
import {
  createError,
  defineEventHandler,
  getValidatedRouterParams,
  setResponseStatus,
} from "h3";

import { useEvents } from "~~/server/composables/events";

/** Deletes an event, and answers 204. An id no event has is 404. */
export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, eventId.parse);
  const removed = await useEvents().remove(id);
  if (!removed) {
    throw createError({ statusCode: 404, message: "Event not found" });
  }
  setResponseStatus(event, 204);
  return null;
});
