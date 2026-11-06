import { staffId } from "@bbf/schema";
import { createError, defineEventHandler, getValidatedRouterParams } from "h3";

import { useStaffAvatar } from "~~/server/composables/avatars";

/** A member's photo, removed: the record without one is the answer. */
export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, staffId.parse);
  const record = await useStaffAvatar(event).clear(id);
  if (record === null) {
    throw createError({ statusCode: 404, message: "Staff member not found" });
  }
  return record;
});
