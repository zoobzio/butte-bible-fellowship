import { folderId, folderPlacement } from "@bbf/schema";
import {
  createError,
  defineEventHandler,
  getValidatedRouterParams,
  readValidatedBody,
} from "h3";

import { useFolders } from "~~/server/composables/folders";

/** A folder, moved into another or to the top. */
export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, folderId.parse);
  const placement = await readValidatedBody(event, folderPlacement.parse);
  const record = await useFolders().setParent(id, placement);
  if (record === "missing") {
    throw createError({ statusCode: 404, message: "Folder not found" });
  }
  if (record === "taken") {
    throw createError({
      statusCode: 409,
      message: "A folder there already has that name",
    });
  }
  if (record === "gone") {
    throw createError({ statusCode: 409, message: "The folder is gone" });
  }
  if (record === "refused") {
    throw createError({
      statusCode: 409,
      message: "A folder cannot be moved into itself or a folder inside it",
    });
  }
  return record;
});
