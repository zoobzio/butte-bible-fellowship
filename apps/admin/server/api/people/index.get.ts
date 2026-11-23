import { personQuery } from "@bbf/schema";
import { defineEventHandler, getValidatedQuery, setResponseStatus } from "h3";

import { usePeople } from "~~/server/composables/people";

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, personQuery.parse);
  const listing = await usePeople().list(query);
  // Asked since a mark the people still stand at: nothing to say.
  if (listing === null) setResponseStatus(event, 204);
  return listing;
});
