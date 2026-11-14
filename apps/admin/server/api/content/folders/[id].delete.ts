import { folderId } from "@bbf/schema";
import {
  createError,
  defineEventHandler,
  getValidatedRouterParams,
  setResponseStatus,
} from "h3";

import { useFolders } from "~~/server/composables/folders";

/** A folder that holds nothing, removed. */
export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, folderId.parse);
  const removed = await useFolders().remove(id);
  if (removed === "missing") {
    throw createError({ statusCode: 404, message: "Folder not found" });
  }
  if (removed === "refused") {
    throw createError({
      statusCode: 409,
      message: "The folder is not empty",
    });
  }
  setResponseStatus(event, 204);
  return null;
});
