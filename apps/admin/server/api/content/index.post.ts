import { contentDraft } from "@bbf/schema";
import {
  createError,
  defineEventHandler,
  readValidatedBody,
  setResponseStatus,
} from "h3";

import { useContent } from "~~/server/composables/content";

export default defineEventHandler(async (event) => {
  const draft = await readValidatedBody(event, contentDraft.parse);
  const record = await useContent().create(draft);
  if (record === "gone") {
    throw createError({ statusCode: 409, message: "The folder is gone" });
  }
  if (record === null) {
    throw createError({ statusCode: 500, message: "Page was not written" });
  }
  setResponseStatus(event, 201);
  return record;
});
