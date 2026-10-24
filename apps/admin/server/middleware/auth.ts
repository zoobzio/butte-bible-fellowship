import { defineEventHandler, getRequestURL } from "h3";

import { AUTH_PREFIX } from "~~/server/constants/auth";
import { useAuthentication } from "~~/server/composables/auth";

/**
 * Every API route but the auth actions answers only a signed-in user who
 * holds the scope it needs. The pages check the same scopes, but the API
 * is what holds the line.
 */
export default defineEventHandler(async (event) => {
  const { pathname } = getRequestURL(event);
  if (!pathname.startsWith("/api/") || pathname.startsWith(`${AUTH_PREFIX}/`)) {
    return;
  }
  await useAuthentication().authorize(event);
});
