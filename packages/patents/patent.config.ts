import { defineConfig } from "@letters-patent/kit";

export default defineConfig({
  resource: "./src/resource.json",
  claims: "./src/claims.json",
  issuers: { google: "./src/issuers/google.json" },
  describe: {
    scopes: {
      "events:read": "View events",
      "events:write": "Create, edit and remove events",
      "staff:read": "View staff",
      "staff:write": "Create, edit and remove staff",
      "users:read": "View who may sign in to the admin",
      "users:write": "Add, change and remove who may sign in to the admin",
    },
    roles: {
      admin: "Full control of the admin",
      editor: "Edit the site's records, but not who may sign in",
    },
  },
  outDir: ".output",
});
