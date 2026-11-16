import { defineConfig } from "@letters-patent/kit";

export default defineConfig({
  resource: "./src/resource.json",
  claims: "./src/claims.json",
  issuers: { google: "./src/issuers/google.json" },
  describe: {
    scopes: {
      "content:read": "View the site's pages",
      "content:write": "Create, edit and remove the site's pages",
      "events:read": "View events",
      "events:write": "Create, edit and remove events",
      "settings:read": "View the site's settings: how it looks",
      "settings:write": "Change the site's settings",
      "site:read":
        "View the site's own pages: its home page, About Us and the connect page",
      "site:write": "Change the site's own pages",
      "staff:read": "View staff",
      "staff:write": "Create, edit and remove staff",
      "users:read": "View who may sign in to the admin",
      "users:write": "Add, change and remove who may sign in to the admin",
      "views:read": "View your own saved views of the admin's lists",
      "views:write": "Save, rename and remove your own saved views",
    },
    roles: {
      admin: "Full control of the admin",
      editor: "Edit the site's records, but not who may sign in",
    },
  },
  outDir: ".output",
});
