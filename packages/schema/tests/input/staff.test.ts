import { describe, expect, it } from "vitest";

import { staffBody, staffPath } from "../../src/input/staff";

const MEMBER = { slug: "jane-doe", name: "Jane Doe", role: "Elder" };

describe("staffPath", () => {
  it("names a member by their slug", () => {
    expect(staffPath.parse({ slug: "jane-doe" })).toEqual({ slug: "jane-doe" });
    expect(staffPath.safeParse({ slug: "Jane Doe" }).success).toBe(false);
  });
});

describe("staffBody", () => {
  it("puts a member last when not told where", () => {
    expect(staffBody.parse(MEMBER)).toEqual({ ...MEMBER, position: 0 });
  });

  it("accepts all a member can say", () => {
    const value = {
      ...MEMBER,
      bio: "Has served since 2010.",
      photo: "/staff/jane-doe.jpg",
      email: "jane@example.com",
      position: 2,
    };
    expect(staffBody.parse(value)).toEqual(value);
  });

  it("needs a slug, a name and a role", () => {
    expect(
      staffBody.safeParse({ name: "Jane Doe", role: "Elder" }).success,
    ).toBe(false);
    expect(staffBody.safeParse({ ...MEMBER, name: "" }).success).toBe(false);
    expect(staffBody.safeParse({ ...MEMBER, role: "" }).success).toBe(false);
  });

  it("rejects a position that is not a whole number from zero", () => {
    expect(staffBody.safeParse({ ...MEMBER, position: -1 }).success).toBe(
      false,
    );
    expect(staffBody.safeParse({ ...MEMBER, position: 1.5 }).success).toBe(
      false,
    );
  });
});
