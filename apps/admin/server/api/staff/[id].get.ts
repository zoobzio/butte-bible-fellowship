import { staffId } from "@bbf/schema";
import { createError, defineEventHandler, getValidatedRouterParams } from "h3";

import { useStaff } from "~~/server/composables/staff";

/** One member of the staff, by id, whatever their status. An id no member has is 404. */
export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, staffId.parse);
  const record = await useStaff().fetch(id);
  if (record === null) {
    throw createError({ statusCode: 404, message: "Staff member not found" });
  }
  return record;
});
