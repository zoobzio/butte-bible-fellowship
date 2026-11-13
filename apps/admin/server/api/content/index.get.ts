import { contentQuery } from "@bbf/schema";
import { defineEventHandler, getValidatedQuery } from "h3";

import { useContent } from "~~/server/composables/content";

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, contentQuery.parse);
  return useContent().list(query);
});
