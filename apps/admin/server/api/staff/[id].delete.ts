import { staffId } from "@bbf/schema";
import {
  createError,
  defineEventHandler,
  getValidatedRouterParams,
  setResponseStatus,
} from "h3";

import { useStaffAvatar } from "~~/server/composables/avatars";
import { useStaff } from "~~/server/composables/staff";

/** A member, removed, and the photo they had dropped from the store. */
export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, staffId.parse);
  const staff = useStaff();
  const current = await staff.fetch(id);
  if (current === null || !(await staff.remove(id))) {
    throw createError({ statusCode: 404, message: "Staff member not found" });
  }
  await useStaffAvatar(event).discard(current.photo);
  setResponseStatus(event, 204);
  return null;
});
