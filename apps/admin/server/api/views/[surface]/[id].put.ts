import type { ViewBody } from "@bbf/schema/types";

import { VIEW_BODIES, viewPath } from "@bbf/schema";
import {
  createError,
  defineEventHandler,
  getValidatedRouterParams,
  readValidatedBody,
} from "h3";

import { useAuthentication } from "~~/server/composables/auth";
import { useViews } from "~~/server/composables/views";

/**
 * A view, saved under the id its maker gave it: written when it is new,
 * and replaced, its name and its payload, when it is theirs already. The
 * payload is held to the schema of the list the view is of, whichever of
 * the lists that is.
 */
export default defineEventHandler(async (event) => {
  const path = await getValidatedRouterParams(event, viewPath.parse);
  const body = await readValidatedBody(event, (data): ViewBody =>
    VIEW_BODIES[path.surface].parse(data),
  );
  const sub = await useAuthentication().subject(event);
  const record = await useViews().save(sub, path, body);
  if (record === null) {
    throw createError({
      statusCode: 409,
      message: "You can only save your own views",
    });
  }
  return record;
});
