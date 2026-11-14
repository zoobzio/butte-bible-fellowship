import { createError, defineEventHandler } from "h3";

import { useConnect } from "~~/server/composables/connect";

/** The connect page, as the admin reads it. */
export default defineEventHandler(async () => {
  const record = await useConnect().fetch();
  if (record === null) {
    throw createError({ statusCode: 404, message: "Page not found" });
  }
  return record;
});
