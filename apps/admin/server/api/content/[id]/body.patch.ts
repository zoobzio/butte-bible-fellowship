import { contentArticle, contentId } from "@bbf/schema";
import {
  createError,
  defineEventHandler,
  getValidatedRouterParams,
  readValidatedBody,
} from "h3";

import { useContent } from "~~/server/composables/content";

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, contentId.parse);
  const body = await readValidatedBody(event, contentArticle.parse);
  const record = await useContent().setBody(id, body);
  if (record === null) {
    throw createError({ statusCode: 404, message: "Page not found" });
  }
  return record;
});
