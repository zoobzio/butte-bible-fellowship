import { aboutArticle } from "@bbf/schema";
import { createError, defineEventHandler, readValidatedBody } from "h3";

import { useAbout } from "~~/server/composables/about";

/** What is written on About Us, on its own. */
export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, aboutArticle.parse);
  const record = await useAbout().setBody(body);
  if (record === null) {
    throw createError({ statusCode: 404, message: "Page not found" });
  }
  return record;
});
