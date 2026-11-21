import { defineEventHandler } from "h3";

import { useContentPaths } from "~~/server/composables/paths";

/** What a path names, written anew where it stands: a document's metadata, or a folder's name. */
export default defineEventHandler((event) => useContentPaths().update(event));
