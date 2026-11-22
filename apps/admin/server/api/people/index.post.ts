import { personBody } from "@bbf/schema";
import {
  createError,
  defineEventHandler,
  readValidatedBody,
  setResponseStatus,
} from "h3";

import { usePeople } from "~~/server/composables/people";

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, personBody.parse);
  const record = await usePeople().create(body);
  if (record === null) {
    throw createError({
      statusCode: 500,
      message: "Person was not written",
    });
  }
  setResponseStatus(event, 201);
  return record;
});
