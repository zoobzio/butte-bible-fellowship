import { defineEventHandler } from "h3";

import { useContentPaths } from "~~/server/composables/paths";

/** What a path of the content names: a document, or a folder with what it holds. */
export default defineEventHandler((event) => useContentPaths().read(event));
