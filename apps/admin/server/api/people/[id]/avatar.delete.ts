import { personId } from "@bbf/schema";
import { createError, defineEventHandler, getValidatedRouterParams } from "h3";

import { usePersonAvatar } from "~~/server/composables/avatars";

/** A person's photo, removed: the record without one is the answer. */
export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, personId.parse);
  const record = await usePersonAvatar(event).clear(id);
  if (record === null) {
    throw createError({ statusCode: 404, message: "Person not found" });
  }
  return record;
});
