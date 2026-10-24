import type { Role, Scope } from "@bbf/patents";

/** The route prefix the auth actions live under, the module's default. */
export const AUTH_PREFIX = "/api/auth";

/**
 * What each role may do. The roles are the `user_role` of the `users`
 * table and of `@bbf/patents`; the scopes are the admin's. Only an admin
 * may say who signs in.
 */
export const GRANTS: Record<Role, readonly Scope[]> = {
  admin: [
    "events:read",
    "events:write",
    "staff:read",
    "staff:write",
    "users:read",
    "users:write",
  ],
  editor: ["events:read", "events:write", "staff:read", "staff:write"],
};
