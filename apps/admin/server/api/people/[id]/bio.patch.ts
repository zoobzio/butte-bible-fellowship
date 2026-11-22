import { personBio, personId } from "@bbf/schema";
import {
  createError,
  defineEventHandler,
  getValidatedRouterParams,
  readValidatedBody,
} from "h3";

import { usePeople } from "~~/server/composables/people";

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, personId.parse);
  const body = await readValidatedBody(event, personBio.parse);
  const record = await usePeople().setBio(id, body);
  if (record === null) {
    throw createError({ statusCode: 404, message: "Person not found" });
  }
  return record;
});
