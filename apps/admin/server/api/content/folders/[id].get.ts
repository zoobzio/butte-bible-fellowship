import { folderId } from "@bbf/schema";
import { createError, defineEventHandler, getValidatedRouterParams } from "h3";

import { useFolders } from "~~/server/composables/folders";

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, folderId.parse);
  const record = await useFolders().fetch(id);
  if (record === null) {
    throw createError({ statusCode: 404, message: "Folder not found" });
  }
  return record;
});
