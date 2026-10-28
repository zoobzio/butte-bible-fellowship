import { defineEventHandler, getRequestURL } from "h3";

import { AUTH_PREFIX } from "~~/server/constants/auth";
import { useAuthentication } from "~~/server/composables/auth";

export default defineEventHandler(async (event) => {
  const { pathname } = getRequestURL(event);
  if (!pathname.startsWith("/api/") || pathname.startsWith(`${AUTH_PREFIX}/`)) {
    return;
  }
  await useAuthentication().authorize(event);
});
