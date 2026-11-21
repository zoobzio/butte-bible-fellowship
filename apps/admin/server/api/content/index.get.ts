import { defineEventHandler } from "h3";

import { useContentPaths } from "~~/server/composables/paths";

/** The top of the content, with what it holds: the path of no steps. */
export default defineEventHandler((event) => useContentPaths().read(event));
