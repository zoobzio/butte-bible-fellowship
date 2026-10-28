import { sermonPath } from "@bbf/schema";
import { createError, defineEventHandler, getRouterParams } from "h3";

import { useSermons } from "~~/server/composables/sermons";

export default defineEventHandler(async (event) => {
  const { slug } = sermonPath.parse(getRouterParams(event));
  const found = await useSermons().fetch(slug);
  if (found === null) {
    throw createError({ statusCode: 404, message: "Sermon not found" });
  }
  return found;
});
