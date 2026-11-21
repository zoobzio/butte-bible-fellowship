import { defineEventHandler } from "h3";

import { useContentPaths } from "~~/server/composables/paths";

/** What a path names, removed: a document, or a folder that holds nothing. */
export default defineEventHandler((event) => useContentPaths().remove(event));
