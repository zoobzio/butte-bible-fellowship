import { staffBody, staffId } from "@bbf/schema";
import {
  createError,
  defineEventHandler,
  getValidatedRouterParams,
  readValidatedBody,
} from "h3";

import { useStaff } from "~~/server/composables/staff";

/** Replaces every field of a member from their body, and answers with the record. An id no member has is 404. */
export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, staffId.parse);
  const body = await readValidatedBody(event, staffBody.parse);
  const record = await useStaff().update(id, body);
  if (record === null) {
    throw createError({ statusCode: 404, message: "Staff member not found" });
  }
  return record;
});
