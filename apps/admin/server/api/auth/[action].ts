import { defineAuthHandlers } from "@letters-patent/nuxt/server";

import { schema, useAuthentication } from "~~/server/composables/auth";

/**
 * The auth actions under `/api/auth/*` — `session`, `login`, `callback`,
 * `logout`, `refresh` — over Google sign-in, constructed per request.
 */
export default defineAuthHandlers(schema, useAuthentication().provider);
