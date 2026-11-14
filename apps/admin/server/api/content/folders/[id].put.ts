import { folderBody, folderId } from "@bbf/schema";
import {
  createError,
  defineEventHandler,
  getValidatedRouterParams,
  readValidatedBody,
} from "h3";

import { useFolders } from "~~/server/composables/folders";

/** A folder, renamed where it stands. */
export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, folderId.parse);
  const body = await readValidatedBody(event, folderBody.parse);
  const record = await useFolders().update(id, body);
  if (record === "taken") {
    throw createError({
      statusCode: 409,
      message: "A folder here already has that name",
    });
  }
  if (record === null || record === "gone") {
    throw createError({ statusCode: 404, message: "Folder not found" });
  }
  return record;
});
