import { createError, defineEventHandler } from "h3";

import { useAbout } from "~~/server/composables/about";

/** About Us, as the settings read it. */
export default defineEventHandler(async () => {
  const record = await useAbout().fetch();
  if (record === null) {
    throw createError({ statusCode: 404, message: "Page not found" });
  }
  return record;
});
