import { staffBody } from "@bbf/schema";
import {
  createError,
  defineEventHandler,
  readValidatedBody,
  setResponseStatus,
} from "h3";

import { useStaff } from "~~/server/composables/staff";

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
