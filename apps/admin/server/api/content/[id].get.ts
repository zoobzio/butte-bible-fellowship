import { contentId } from "@bbf/schema";
import { createError, defineEventHandler, getValidatedRouterParams } from "h3";

import { useContent } from "~~/server/composables/content";

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, contentId.parse);
  const record = await useContent().fetch(id);
  if (record === null) {
    throw createError({ statusCode: 404, message: "Page not found" });
  }
  return record;
});
