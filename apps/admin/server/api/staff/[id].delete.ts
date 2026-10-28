import { staffId } from "@bbf/schema";
import {
  createError,
  defineEventHandler,
  getValidatedRouterParams,
  setResponseStatus,
} from "h3";

import { useStaff } from "~~/server/composables/staff";

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, staffId.parse);
  const removed = await useStaff().remove(id);
  if (!removed) {
    throw createError({ statusCode: 404, message: "Staff member not found" });
  }
  setResponseStatus(event, 204);
  return null;
});
