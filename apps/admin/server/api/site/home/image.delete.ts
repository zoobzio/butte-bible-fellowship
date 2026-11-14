import { createError, defineEventHandler } from "h3";

import { useHomeImage } from "~~/server/composables/avatars";

/**
 * The picture of the home page's hero, removed: the record without one is
 * the answer, and the site shows its own in its place.
 */
export default defineEventHandler(async (event) => {
  const record = await useHomeImage(event).clear();
  if (record === null) {
    throw createError({ statusCode: 404, message: "Page not found" });
  }
  return record;
});
