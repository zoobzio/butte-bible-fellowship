import { contentBody } from "@bbf/schema";
import {
  createError,
  defineEventHandler,
  readValidatedBody,
  setResponseStatus,
} from "h3";

import { useContent } from "~~/server/composables/content";

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, contentBody.parse);
  const record = await useContent().create(body);
  if (record === null) {
    throw createError({ statusCode: 500, message: "Page was not written" });
  }
  setResponseStatus(event, 201);
  return record;
});
