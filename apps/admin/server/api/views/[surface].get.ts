import { viewList } from "@bbf/schema";
import { defineEventHandler, getValidatedRouterParams } from "h3";

import { useAuthentication } from "~~/server/composables/auth";
import { useViews } from "~~/server/composables/views";

/** The views whoever is signed in has saved of one list. */
export default defineEventHandler(async (event) => {
  const { surface } = await getValidatedRouterParams(event, viewList.parse);
  const sub = await useAuthentication().subject(event);
  return useViews().list(sub, surface);
});
