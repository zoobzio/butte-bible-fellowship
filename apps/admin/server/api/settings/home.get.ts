import { createError, defineEventHandler } from "h3";

import { useHome } from "~~/server/composables/home";

/** The home page, as the settings read it. */
export default defineEventHandler(async () => {
  const record = await useHome().fetch();
  if (record === null) {
    throw createError({ statusCode: 404, message: "Page not found" });
  }
  return record;
});
