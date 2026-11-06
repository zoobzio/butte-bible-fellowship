import { STAFF_AVATAR_SIZE, staffAvatar, staffId } from "@bbf/schema";
import {
  createError,
  defineEventHandler,
  getRequestHeader,
  getValidatedRouterParams,
  readFormData,
} from "h3";

import { useStaffAvatar } from "~~/server/composables/avatars";
import { AVATAR_FIELD, AVATAR_FORM_SPARE } from "~~/server/constants/avatars";

/**
 * A member's photo, uploaded: a form with the image as its `file`. The
 * image is kept in the store and the member pointed at it, and the record
 * is the answer. A request too large to be a photo is refused before it is
 * read.
 */
export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, staffId.parse);
  const length = Number(getRequestHeader(event, "content-length"));
  if (length > STAFF_AVATAR_SIZE + AVATAR_FORM_SPARE) {
    throw createError({ statusCode: 413, message: "Photo is too large" });
  }
  const form = await readFormData(event).catch(() => null);
  const file = staffAvatar.safeParse(form?.get(AVATAR_FIELD));
  if (!file.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Validation Error",
      message: "Validation Error",
      data: file.error,
    });
  }
  const record = await useStaffAvatar(event).replace(id, file.data);
  if (record === null) {
    throw createError({ statusCode: 404, message: "Staff member not found" });
  }
  return record;
});
