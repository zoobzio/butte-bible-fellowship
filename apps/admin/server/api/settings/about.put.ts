import { aboutBody } from "@bbf/schema";
import { createError, defineEventHandler, readValidatedBody } from "h3";

import { useAbout } from "~~/server/composables/about";

/** About Us's metadata, replaced. */
export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, aboutBody.parse);
  const record = await useAbout().update(body);
  if (record === null) {
    throw createError({ statusCode: 404, message: "Page not found" });
  }
  return record;
});
