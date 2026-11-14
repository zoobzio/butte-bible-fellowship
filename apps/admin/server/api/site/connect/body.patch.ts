import { connectArticle } from "@bbf/schema";
import { createError, defineEventHandler, readValidatedBody } from "h3";

import { useConnect } from "~~/server/composables/connect";

/** What is written on the connect page, on its own. */
export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, connectArticle.parse);
  const record = await useConnect().setBody(body);
  if (record === null) {
    throw createError({ statusCode: 404, message: "Page not found" });
  }
  return record;
});
