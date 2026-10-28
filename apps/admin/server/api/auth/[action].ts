import { defineAuthHandlers } from "@letters-patent/nuxt/server";

import { schema, useAuthentication } from "~~/server/composables/auth";

export default defineAuthHandlers(schema, useAuthentication().provider);
