import { viewPath } from "@bbf/schema";
import {
  createError,
  defineEventHandler,
  getValidatedRouterParams,
  setResponseStatus,
} from "h3";

import { useAuthentication } from "~~/server/composables/auth";
import { useViews } from "~~/server/composables/views";

/** A view of whoever is signed in, removed. */
export default defineEventHandler(async (event) => {
  const path = await getValidatedRouterParams(event, viewPath.parse);
  const sub = await useAuthentication().subject(event);
  if (!(await useViews().remove(sub, path))) {
    throw createError({ statusCode: 404, message: "View not found" });
  }
  setResponseStatus(event, 204);
  return null;
});
