import { defineConfig } from "@letters-patent/kit";

/**
 * The admin's authorization contract. `src/resource.json` is the admin as an
 * OAuth 2.0 protected resource (RFC 9728) and names its scopes;
 * `src/claims.json` is the claims request (OIDC Core §5.5) naming what it
 * requires of a user and its roles; Google is the issuer, from a vendored
 * discovery document. `patent build` writes the contract modules to
 * `.output/`, which this package exports.
 */
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
