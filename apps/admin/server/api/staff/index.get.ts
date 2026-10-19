import { listingQuery } from "@bbf/schema";
import { defineEventHandler, getValidatedQuery } from "h3";

import { useStaff } from "~~/server/composables/staff";

/** One page of the staff, whatever their status, in their order. A query that is not one is 400. */
export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, listingQuery.parse);
  return useStaff().list(query);
});
