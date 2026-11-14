import { foldersQuery } from "@bbf/schema";
import { defineEventHandler, getValidatedQuery } from "h3";

import { useFolders } from "~~/server/composables/folders";

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, foldersQuery.parse);
  return useFolders().list(query);
});
