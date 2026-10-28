import { defineEventHandler } from "h3";

import { useStaff } from "~~/server/composables/staff";

export default defineEventHandler(() => useStaff().list());
