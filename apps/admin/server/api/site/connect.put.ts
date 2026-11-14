import { connectBody } from "@bbf/schema";
import { createError, defineEventHandler, readValidatedBody } from "h3";

import { useConnect } from "~~/server/composables/connect";

/** The connect page's metadata, replaced. */
export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, connectBody.parse);
  const record = await useConnect().update(body);
  if (record === null) {
    throw createError({ statusCode: 404, message: "Page not found" });
  }
  return record;
});
