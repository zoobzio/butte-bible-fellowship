import { staffBio, staffId } from "@bbf/schema";
import {
  createError,
  defineEventHandler,
  getValidatedRouterParams,
  readValidatedBody,
} from "h3";

import { useStaff } from "~~/server/composables/staff";

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, staffId.parse);
  const body = await readValidatedBody(event, staffBio.parse);
  const record = await useStaff().setBio(id, body);
  if (record === null) {
    throw createError({ statusCode: 404, message: "Staff member not found" });
  }
  return record;
});
