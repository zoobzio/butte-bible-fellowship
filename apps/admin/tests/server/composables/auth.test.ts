import { afterEach, describe, expect, it, vi } from "vitest";

import { contract as database } from "@bbf/database";
import { roles, scopes } from "@bbf/patents";
import { service } from "@bbf/nuxt/testing/bezoar";
import { bridge, schema } from "~~/server/composables/auth";
import { GRANTS as grants } from "~~/server/constants/auth";
import { requiredScope } from "~~/server/utils/auth";

// Vitest hoists the mock over the imports: the composable reads its
// runtime config from Nitro, which is not here.
vi.mock("nitropack/runtime", () => ({ useRuntimeConfig: () => ({}) }));

const SUB = "104958204857204857204";

/** Google's ID token claims for a verified account. */
const CLAIMS = {
  iss: "https://accounts.google.com",
  aud: "client",
  iat: 1_790_000_000,
  exp: 1_790_003_600,
  sub: SUB,
  email: "pastor@example.com",
  email_verified: true,
  name: "Pastor Name",
  picture: "https://example.com/pastor.jpg",
};

/** A user as `admin.users.subject` and `admin.users.claim` return one. */
const USER = {
  id: 1,
  email: "pastor@example.com",
  name: "Pastor Name",
  picture: null,
  role: "editor" as const,
};

const subject = vi.fn(async (_: { sub: string }) => null as typeof USER | null);
const claim = vi.fn(async (_: object) => null as typeof USER | null);

Object.assign(service, {
  admin: {
    users: { subject: { first: subject }, claim: { first: claim } },
  },
});

afterEach(() => {
  subject.mockReset().mockResolvedValue(null);
  claim.mockReset().mockResolvedValue(null);
});

describe("the contract", () => {
  it("holds the roles of the users table", () => {
    expect(roles).toEqual(database.enums.user_role);
  });

  it("grants every scope to an admin, and no scope it does not know", () => {
    expect(Object.keys(grants)).toEqual(roles);
    expect([...grants.admin].sort()).toEqual([...scopes].sort());
    expect(grants.editor).not.toContain("users:write");
  });
});

describe("bridge", () => {
  it("grants a bound user their role's scopes", async () => {
    subject.mockResolvedValue(USER);
    const user = await bridge(CLAIMS);
    expect(subject).toHaveBeenCalledWith({ sub: SUB });
    expect(claim).not.toHaveBeenCalled();
    expect(user).toMatchObject({
      sub: SUB,
      email: "pastor@example.com",
      roles: ["editor"],
      scopes: grants.editor,
    });
    expect(schema.check.user(user)).toBe(true);
  });

  it("binds a user added by email on their first sign-in", async () => {
    claim.mockResolvedValue({ ...USER, role: "admin" });
    const user = await bridge(CLAIMS);
    expect(claim).toHaveBeenCalledWith({
      sub: SUB,
      email: "pastor@example.com",
      name: "Pastor Name",
      picture: "https://example.com/pastor.jpg",
    });
    expect(user).toMatchObject({ roles: ["admin"], scopes: grants.admin });
  });

  it("binds no one by an email Google has not verified", async () => {
    const user = await bridge({ ...CLAIMS, email_verified: false });
    expect(claim).not.toHaveBeenCalled();
    expect(user).toMatchObject({ roles: [], scopes: [] });
  });

  it("signs a stranger in with no grants", async () => {
    const user = await bridge(CLAIMS);
    expect(user).toMatchObject({ sub: SUB, roles: [], scopes: [] });
    expect(schema.check.user(user)).toBe(true);
  });
});

describe("requiredScope", () => {
  it("reads with a GET and writes with anything else", () => {
    expect(requiredScope("/api/staff", "GET")).toBe("staff:read");
    expect(requiredScope("/api/staff/3", "HEAD")).toBe("staff:read");
    expect(requiredScope("/api/staff", "POST")).toBe("staff:write");
    expect(requiredScope("/api/events/3", "PUT")).toBe("events:write");
    expect(requiredScope("/api/events/3", "DELETE")).toBe("events:write");
  });

  it("needs a scope nobody holds for records the contract does not name", () => {
    expect(requiredScope("/api/sermons", "GET")).toBeUndefined();
    expect(requiredScope("/api", "GET")).toBeUndefined();
    expect(requiredScope("/staff", "GET")).toBeUndefined();
  });
});
