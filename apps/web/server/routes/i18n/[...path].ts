import { defineContentHandlers } from "#prosary-handlers";

import { useDocuments } from "~~/server/composables/documents";

// The pages the build does not hold: an event's own, from the database.
export default defineContentHandlers({
  list: () => useDocuments().list(),
  get: (_locale, path) => useDocuments().get(path),
});
