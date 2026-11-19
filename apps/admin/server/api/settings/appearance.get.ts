import { createError, defineEventHandler } from "h3";

import { useAppearance } from "~~/server/composables/appearance";

/** How the site looks over what its theme says, as the admin reads it. */
export default defineEventHandler(async () => {
  const record = await useAppearance().fetch();
  if (record === null) {
    throw createError({ statusCode: 404, message: "Appearance not found" });
  }
  return record;
});
