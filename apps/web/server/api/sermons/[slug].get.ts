import { sermonPath } from "@bbf/schema";
import { createError, defineEventHandler, getRouterParams } from "h3";

import { useSermons } from "~~/server/composables/sermons";

/** One sermon, by slug, with what is written about it. A slug no published sermon has is 404. */
export default defineEventHandler(async (event) => {
  const { slug } = sermonPath.parse(getRouterParams(event));
  const found = await useSermons().fetch(slug);
  if (found === null) {
    throw createError({ statusCode: 404, message: "Sermon not found" });
  }
  return found;
});
