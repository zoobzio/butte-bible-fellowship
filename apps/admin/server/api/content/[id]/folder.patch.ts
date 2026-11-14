import { contentId, contentPlacement } from "@bbf/schema";
import {
  createError,
  defineEventHandler,
  getValidatedRouterParams,
  readValidatedBody,
} from "h3";

import { useContent } from "~~/server/composables/content";

/** A page, filed in another folder or at the top. */
export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, contentId.parse);
  const placement = await readValidatedBody(event, contentPlacement.parse);
  const record = await useContent().setFolder(id, placement);
  if (record === "gone") {
    throw createError({ statusCode: 409, message: "The folder is gone" });
  }
  if (record === null) {
    throw createError({ statusCode: 404, message: "Page not found" });
  }
  return record;
});
