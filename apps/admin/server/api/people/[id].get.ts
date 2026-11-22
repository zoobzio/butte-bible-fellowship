import { personId } from "@bbf/schema";
import { createError, defineEventHandler, getValidatedRouterParams } from "h3";

import { usePeople } from "~~/server/composables/people";

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, personId.parse);
  const record = await usePeople().fetch(id);
  if (record === null) {
    throw createError({ statusCode: 404, message: "Person not found" });
  }
  return record;
});
