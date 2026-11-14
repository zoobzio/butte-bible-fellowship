import { folderDraft } from "@bbf/schema";
import {
  createError,
  defineEventHandler,
  readValidatedBody,
  setResponseStatus,
} from "h3";

import { useFolders } from "~~/server/composables/folders";

export default defineEventHandler(async (event) => {
  const draft = await readValidatedBody(event, folderDraft.parse);
  const record = await useFolders().create(draft);
  if (record === "taken") {
    throw createError({
      statusCode: 409,
      message: "A folder here already has that name",
    });
  }
  if (record === "gone") {
    throw createError({ statusCode: 409, message: "The folder is gone" });
  }
  if (record === null) {
    throw createError({ statusCode: 500, message: "Folder was not written" });
  }
  setResponseStatus(event, 201);
  return record;
});
