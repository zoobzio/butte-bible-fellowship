import { appearanceBody } from "@bbf/schema";
import { createError, defineEventHandler, readValidatedBody } from "h3";

import { useAppearance } from "~~/server/composables/appearance";

/** How the site looks over what its theme says, replaced. */
export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, appearanceBody.parse);
  const record = await useAppearance().update(body);
  if (record === null) {
    throw createError({ statusCode: 404, message: "Appearance not found" });
  }
  return record;
});
