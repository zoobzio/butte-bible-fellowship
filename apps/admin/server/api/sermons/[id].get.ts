import { sermonId } from "@bbf/schema";
import { createError, defineEventHandler, getValidatedRouterParams } from "h3";

import { useSermons } from "~~/server/composables/sermons";

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, sermonId.parse);
  const record = await useSermons().fetch(id);
  if (record === null) {
    throw createError({ statusCode: 404, message: "Sermon not found" });
  }
  return record;
});
