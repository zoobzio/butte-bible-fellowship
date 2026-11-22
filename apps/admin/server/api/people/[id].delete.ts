import { personId } from "@bbf/schema";
import {
  createError,
  defineEventHandler,
  getValidatedRouterParams,
  setResponseStatus,
} from "h3";

import { usePersonAvatar } from "~~/server/composables/avatars";
import { usePeople } from "~~/server/composables/people";

/** A person, removed, and the photo they had dropped from the store. */
export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, personId.parse);
  const people = usePeople();
  const current = await people.fetch(id);
  if (current === null || !(await people.remove(id))) {
    throw createError({ statusCode: 404, message: "Person not found" });
  }
  await usePersonAvatar(event).discard(current.photo);
  setResponseStatus(event, 204);
  return null;
});
