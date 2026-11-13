import type { Role, Scope } from "@bbf/patents";

export const AUTH_PREFIX = "/api/auth";

export const GRANTS: Record<Role, readonly Scope[]> = {
  admin: [
    "content:read",
    "content:write",
    "events:read",
    "events:write",
    "staff:read",
    "staff:write",
    "users:read",
    "users:write",
  ],
  editor: [
    "content:read",
    "content:write",
    "events:read",
    "events:write",
    "staff:read",
    "staff:write",
  ],
};
