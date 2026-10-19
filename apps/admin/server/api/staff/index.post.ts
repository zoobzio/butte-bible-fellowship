import { staffBody } from "@bbf/schema";
import {
  createError,
  defineEventHandler,
  readValidatedBody,
  setResponseStatus,
} from "h3";

import { useStaff } from "~~/server/composables/staff";

/** Writes a new member from their body, and answers 201 with the record. A body that is not one is 400; one that writes nothing is 500. */
export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, staffBody.parse);
  const record = await useStaff().create(body);
  if (record === null) {
    throw createError({
      statusCode: 500,
      message: "Staff member was not written",
    });
  }
  setResponseStatus(event, 201);
  return record;
});
