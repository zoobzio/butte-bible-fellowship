import { staffPath } from "@bbf/schema";
import { createError, defineEventHandler, getRouterParams } from "h3";

import { useStaff } from "~~/server/composables/staff";

/** One member of the staff, by slug. A slug no published member has is 404. */
export default defineEventHandler(async (event) => {
  const { slug } = staffPath.parse(getRouterParams(event));
  const member = await useStaff().fetch(slug);
  if (member === null) {
    throw createError({ statusCode: 404, message: "Staff member not found" });
  }
  return member;
});
