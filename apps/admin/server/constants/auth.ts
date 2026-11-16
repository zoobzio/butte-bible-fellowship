import type { Role, Scope } from "@bbf/patents";

export const AUTH_PREFIX = "/api/auth";

export const GRANTS: Record<Role, readonly Scope[]> = {
  admin: [
    "content:read",
    "content:write",
    "events:read",
    "events:write",
    "settings:read",
    "settings:write",
    "site:read",
    "site:write",
    "staff:read",
    "staff:write",
    "users:read",
    "users:write",
    "views:read",
    "views:write",
  ],
  editor: [
    "content:read",
    "content:write",
    "events:read",
    "events:write",
    "settings:read",
    "settings:write",
    "site:read",
    "site:write",
    "staff:read",
    "staff:write",
    "views:read",
    "views:write",
  ],
};
