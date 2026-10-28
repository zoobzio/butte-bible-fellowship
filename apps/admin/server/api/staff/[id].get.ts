import { staffId } from "@bbf/schema";
import { createError, defineEventHandler, getValidatedRouterParams } from "h3";

import { useStaff } from "~~/server/composables/staff";

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, staffId.parse);
  const record = await useStaff().fetch(id);
  if (record === null) {
    throw createError({ statusCode: 404, message: "Staff member not found" });
  }
  return record;
});
