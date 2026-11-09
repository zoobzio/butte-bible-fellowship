import { EVENT_IMAGE_SIZE, eventId, eventImage } from "@bbf/schema";
import {
  createError,
  defineEventHandler,
  getRequestHeader,
  getValidatedRouterParams,
  readFormData,
} from "h3";

import { useEventImage } from "~~/server/composables/avatars";
import { AVATAR_FIELD, AVATAR_FORM_SPARE } from "~~/server/constants/avatars";

/**
 * An event's picture, uploaded: a form with the image as its `file`. The
 * image is kept in the store and the event pointed at it, and the record
 * is the answer. A request too large to be a picture is refused before it is
 * read.
 */
export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, eventId.parse);
  const length = Number(getRequestHeader(event, "content-length"));
  if (length > EVENT_IMAGE_SIZE + AVATAR_FORM_SPARE) {
    throw createError({ statusCode: 413, message: "Picture is too large" });
  }
  const form = await readFormData(event).catch(() => null);
  const file = eventImage.safeParse(form?.get(AVATAR_FIELD));
  if (!file.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Validation Error",
      message: "Validation Error",
      data: file.error,
    });
  }
  const record = await useEventImage(event).replace(id, file.data);
  if (record === null) {
    throw createError({ statusCode: 404, message: "Event not found" });
  }
  return record;
});
