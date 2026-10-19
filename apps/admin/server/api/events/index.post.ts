import { eventBody } from "@bbf/schema";
import {
  createError,
  defineEventHandler,
  readValidatedBody,
  setResponseStatus,
} from "h3";

import { useEvents } from "~~/server/composables/events";

/** Writes a new event from its body, and answers 201 with the record. A body that is not one is 400; one that writes nothing is 500. */
export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, eventBody.parse);
  const record = await useEvents().create(body);
  if (record === null) {
    throw createError({ statusCode: 500, message: "Event was not written" });
  }
  setResponseStatus(event, 201);
  return record;
});
