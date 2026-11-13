import { contentId } from "@bbf/schema";
import {
  createError,
  defineEventHandler,
  getValidatedRouterParams,
  setResponseStatus,
} from "h3";

import { useContent } from "~~/server/composables/content";

/** A page of the site, removed. */
export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, contentId.parse);
  if (!(await useContent().remove(id))) {
    throw createError({ statusCode: 404, message: "Page not found" });
  }
  setResponseStatus(event, 204);
  return null;
});
