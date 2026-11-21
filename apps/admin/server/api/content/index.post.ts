import { defineEventHandler } from "h3";

import { useContentPaths } from "~~/server/composables/paths";

/** A new document or a new folder, made at the top: the path of no steps. */
export default defineEventHandler((event) => useContentPaths().create(event));
