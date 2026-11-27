import type { Role, Scope } from "@bbf/patents";

export const AUTH_PREFIX = "/api/auth";

export const GRANTS: Record<Role, readonly Scope[]> = {
  admin: [
    "content:read",
    "content:write",
    "events:read",
    "events:write",
    "people:read",
    "people:write",
    "sermons:read",
    "sermons:write",
    "settings:read",
    "settings:write",
    "site:read",
    "site:write",
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
    "people:read",
    "people:write",
    "sermons:read",
    "sermons:write",
    "settings:read",
    "settings:write",
    "site:read",
    "site:write",
    "views:read",
    "views:write",
  ],
};
