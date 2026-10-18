import { describe, expect, it } from "vitest";

import { staffMember } from "../../src/models/staff";

describe("staffMember", () => {
  it("needs a name and a role", () => {
    const value = { name: "Jane Doe", role: "Elder" };
    expect(staffMember.parse(value)).toEqual(value);
    expect(staffMember.safeParse({ name: "Jane Doe" }).success).toBe(false);
  });

  it("accepts all a member can say", () => {
    const value = {
      name: "Jane Doe",
      role: "Pastor",
      bio: "Has served since 2010.",
      photo: "/staff/jane-doe.jpg",
      email: "jane@example.com",
    };
    expect(staffMember.parse(value)).toEqual(value);
  });

  it("rejects an email that is not one", () => {
    expect(
      staffMember.safeParse({ name: "Jane Doe", role: "Elder", email: "jane" })
        .success,
    ).toBe(false);
  });
});
