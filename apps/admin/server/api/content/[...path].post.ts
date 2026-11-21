import { defineEventHandler } from "h3";

import { useContentPaths } from "~~/server/composables/paths";

/** A new document or a new folder, made in the folder the path names. */
export default defineEventHandler((event) => useContentPaths().create(event));
