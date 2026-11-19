import { defineEventHandler } from "h3";

import { useAppearance } from "~~/server/composables/appearance";

/** How the site looks over what its theme says, as the site reads it. */
export default defineEventHandler(() => useAppearance().fetch());
