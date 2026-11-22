import { PERSON_AVATAR_SIZE, personAvatar, personId } from "@bbf/schema";
import {
  createError,
  defineEventHandler,
  getRequestHeader,
  getValidatedRouterParams,
  readFormData,
} from "h3";

import { usePersonAvatar } from "~~/server/composables/avatars";
import { AVATAR_FIELD, AVATAR_FORM_SPARE } from "~~/server/constants/avatars";

/**
 * A person's photo, uploaded: a form with the image as its `file`. The
 * image is kept in the store and the person pointed at it, and the record
 * is the answer. A request too large to be a photo is refused before it is
 * read.
 */
export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, personId.parse);
  const length = Number(getRequestHeader(event, "content-length"));
  if (length > PERSON_AVATAR_SIZE + AVATAR_FORM_SPARE) {
    throw createError({ statusCode: 413, message: "Photo is too large" });
  }
  const form = await readFormData(event).catch(() => null);
  const file = personAvatar.safeParse(form?.get(AVATAR_FIELD));
  if (!file.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Validation Error",
      message: "Validation Error",
      data: file.error,
    });
  }
  const record = await usePersonAvatar(event).replace(id, file.data);
  if (record === null) {
    throw createError({ statusCode: 404, message: "Person not found" });
  }
  return record;
});
