import { defineEventHandler } from "h3";

import { useContentPaths } from "~~/server/composables/paths";

/** One part of what a path names, written on its own: where it is, or what is written on a document. */
export default defineEventHandler((event) => useContentPaths().patch(event));
