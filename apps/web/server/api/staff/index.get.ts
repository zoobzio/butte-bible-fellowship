import { defineEventHandler } from "h3";

import { useStaff } from "~~/server/composables/staff";

/** The staff the site lists, in their order: what the connect page shows. */
export default defineEventHandler(() => useStaff().list());
