import { defineContentHandlers } from "#prosary-handlers";

import { useDocuments } from "~~/server/composables/documents";

// The pages, which no build holds: the site's own and each event's, from
// the database.
export default defineContentHandlers({
  list: () => useDocuments().list(),
  get: (_locale, path) => useDocuments().get(path),
});
