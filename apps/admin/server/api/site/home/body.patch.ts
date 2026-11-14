import { homeArticle } from "@bbf/schema";
import { createError, defineEventHandler, readValidatedBody } from "h3";

import { useHome } from "~~/server/composables/home";

/** What is written on the home page, on its own. */
export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, homeArticle.parse);
  const record = await useHome().setBody(body);
  if (record === null) {
    throw createError({ statusCode: 404, message: "Page not found" });
  }
  return record;
});
