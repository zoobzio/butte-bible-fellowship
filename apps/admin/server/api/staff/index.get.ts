import { staffQuery } from "@bbf/schema";
import { defineEventHandler, getValidatedQuery } from "h3";

import { useStaff } from "~~/server/composables/staff";

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, staffQuery.parse);
  return useStaff().list(query);
});
