import { homeBody } from "@bbf/schema";
import { createError, defineEventHandler, readValidatedBody } from "h3";

import { useHome } from "~~/server/composables/home";

/** The home page's metadata, replaced. */
export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, homeBody.parse);
  const record = await useHome().update(body);
  if (record === null) {
    throw createError({ statusCode: 404, message: "Page not found" });
  }
  return record;
});
