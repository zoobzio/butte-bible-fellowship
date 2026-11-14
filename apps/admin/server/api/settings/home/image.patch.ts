import { HOME_IMAGE_SIZE, homeImage } from "@bbf/schema";
import {
  createError,
  defineEventHandler,
  getRequestHeader,
  readFormData,
} from "h3";

import { useHomeImage } from "~~/server/composables/avatars";
import { AVATAR_FIELD, AVATAR_FORM_SPARE } from "~~/server/constants/avatars";

/**
 * The picture of the home page's hero, uploaded: a form with the image as
 * its `file`. The image is kept in the store and the page pointed at it,
 * and the record is the answer. A request too large to be a picture is
 * refused before it is read.
 */
export default defineEventHandler(async (event) => {
  const length = Number(getRequestHeader(event, "content-length"));
  if (length > HOME_IMAGE_SIZE + AVATAR_FORM_SPARE) {
    throw createError({ statusCode: 413, message: "Picture is too large" });
  }
  const form = await readFormData(event).catch(() => null);
  const file = homeImage.safeParse(form?.get(AVATAR_FIELD));
  if (!file.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Validation Error",
      message: "Validation Error",
      data: file.error,
    });
  }
  const record = await useHomeImage(event).replace(file.data);
  if (record === null) {
    throw createError({ statusCode: 404, message: "Page not found" });
  }
  return record;
});
