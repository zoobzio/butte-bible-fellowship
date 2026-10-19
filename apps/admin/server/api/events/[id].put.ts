import { eventBody, eventId } from "@bbf/schema";
import {
  createError,
  defineEventHandler,
  getValidatedRouterParams,
  readValidatedBody,
} from "h3";

import { useEvents } from "~~/server/composables/events";

/** Replaces every field of an event from its body, the kind of the event with them, and answers with the record. An id no event has is 404. */
export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, eventId.parse);
  const body = await readValidatedBody(event, eventBody.parse);
  const record = await useEvents().update(id, body);
  if (record === null) {
    throw createError({ statusCode: 404, message: "Event not found" });
  }
  return record;
});
