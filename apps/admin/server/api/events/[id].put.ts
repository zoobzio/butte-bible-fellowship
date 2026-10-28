import { eventBody, eventId } from "@bbf/schema";
import {
  createError,
  defineEventHandler,
  getValidatedRouterParams,
  readValidatedBody,
} from "h3";

import { useEvents } from "~~/server/composables/events";

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, eventId.parse);
  const body = await readValidatedBody(event, eventBody.parse);
  const record = await useEvents().update(id, body);
  if (record === null) {
    throw createError({ statusCode: 404, message: "Event not found" });
  }
  return record;
});
