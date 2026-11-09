import { eventId } from "@bbf/schema";
import {
  createError,
  defineEventHandler,
  getValidatedRouterParams,
  setResponseStatus,
} from "h3";

import { useEventImage } from "~~/server/composables/avatars";
import { useEvents } from "~~/server/composables/events";

/** An event, removed, and the picture it had dropped from the store. */
export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, eventId.parse);
  const events = useEvents();
  const current = await events.fetch(id);
  if (current === null || !(await events.remove(id))) {
    throw createError({ statusCode: 404, message: "Event not found" });
  }
  await useEventImage(event).discard(current.image);
  setResponseStatus(event, 204);
  return null;
});
