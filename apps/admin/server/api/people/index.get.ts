import { personQuery } from "@bbf/schema";
import { defineEventHandler, getValidatedQuery } from "h3";

import { usePeople } from "~~/server/composables/people";

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, personQuery.parse);
  return usePeople().list(query);
});
